import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { db, documents } from "../drizzle/schema";
import { documentSchema } from "../validation/documentvalidation";
import { arrayContains, eq, ilike } from "drizzle-orm";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

// Apply the auth middleware to all routes
router.use(authMiddleware);
// router.use();

// Create a new document (accessible to both Admin and User)
router.post("/addDocument", async (req: Request, res: Response) => {
  const parsed = documentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  const { title, content, author } = parsed.data;
  try {
    const newDocument = await db
      .insert(documents)
      .values({
        title,
        content,
        author,
      })
      .returning();
    res.status(201).json(newDocument);
    console.log("Hello I am here");
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create document" });
  }
});

// Update a document by ID
router.put(
  "/update/:id",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const parsed = documentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const { id } = req.params;
    const { title, content, author } = parsed.data;

    try {
      const updatedDocument = await db
        .update(documents)
        .set({ title, content, author })
        .where(eq(documents.id, id))
        .returning()
        .execute();

      if (updatedDocument.length > 0) {
        res.status(200).json(updatedDocument);
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update document" });
    }
  }
);

// Delete a document by ID
router.delete(
  "/delete/:id",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deleteResult = await db
        .delete(documents)
        .where(eq(documents.id, id))
        .execute();

      if (deleteResult.rowCount && deleteResult.rowCount > 0) {
        res.status(204).send(); // Success: No Content
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  }
);

// Generate a short-lived download link for a document file (accessible to both Admin and User)
router.post(
  "/generate-download-link/:filename",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { filename } = req.params;

    try {
      // Generate a JWT token with file information and expiration time
      const token = jwt.sign({ filename }, JWT_SECRET, {
        expiresIn: LINK_EXPIRATION,
      });

      // Construct the download link
      const downloadLink = `${req.protocol}://${req.get(
        "host"
      )}/documents/download/${token}`;

      res.status(200).json({ downloadLink });
      console.log("Hello I am here");
    } catch (error: any) {
      res.status(500).json({ error: "Failed to generate download link" });
    }
  }
);

// Serve the file using the token (accessible to both Admin and User)
router.get(
  "/download/:token",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { filename: string };

      // Adjusted file path to match your directory structure
      const filePath = path.join(__dirname, "../uploads", decoded.filename);

      console.log("Looking for file at:", filePath); // Log for debugging

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      res.download(filePath);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Download link has expired" });
      }
      console.error(error);
      res.status(500).json({ error: "Failed to download file" });
    }
  }
);


router.get("/search",authorizeRole('Admin'), async (req: Request, res: Response) => {
  console.log("Hello I am here"); 
  const { tags, title, author, metadata } = req.query;

  console.log("Search parameters:", { tags, title, author, metadata });

  try {
    const query = db.select().from(documents);

    // Dynamically use tags provided in the API URL
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      console.log("Filtering by tags:", tagsArray);
      query.where(arrayContains(documents.tags as any, tagsArray as any));
    }

    // Filter by title if provided
    if (title) {
      console.log("Filtering by title:", title);
      query.where(ilike(documents.title, `%${title}%`));
    }

    // Filter by author if provided
    if (author) {
      console.log("Filtering by author:", author);
      query.where(ilike(documents.author, `%${author}%`));
    }

    // Filter by metadata if provided
    if (metadata) {
      try {
        const metadataObj = JSON.parse(metadata as string);
        console.log("Filtering by metadata:", metadataObj);
        Object.keys(metadataObj).forEach((key) => {
          query.where(eq((documents.metadata as any)[key], metadataObj[key]));
        });
      } catch (jsonParseError) {
        console.error(
          "Failed to parse metadata:",
          (jsonParseError as any).message
        );
        return res.status(400).json({ error: "Invalid metadata format" });
      }
    }

    const results = await query;
    console.log("Search results:", results);
    res.json(results);
  } catch (error: any) {
    console.error("Error during search:", error);
    res
      .status(500)
      .json({ error: `An error occurred while searching: ${error.message}` });
  }
});

// Get all documents (accessible to both Admin and User)
router.get("/allDocuments", async (req: Request, res: Response) => {
  try {
    const allDocuments = await db.select().from(documents).execute();
    res.status(200).json(allDocuments);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
});

// Get a single document by ID
router.get(
  "/:id",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .execute();
      const document = result[0];
      if (document) {
        res.status(200).json(document);
        console.log("Hello I am here");
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  }
);

export default router;
