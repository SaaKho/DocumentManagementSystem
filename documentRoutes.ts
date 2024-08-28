import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { db, documents } from "../drizzle/schema";
import { documentSchema } from "../validation/documentvalidation";
import { inArray, arrayContains, eq, ilike, and, sql, or, like } from "drizzle-orm";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

// Apply the auth middleware to all routes
router.use(authMiddleware);

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
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create document" });
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
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  }
);

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
    } catch (error: any) {
      console.error(error);
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

//Advanced Search for docuemnts
// router.get("/search", async (req, res) => {
//   const { tags, metadata, title, author } = req.query;

//   try {
//     const query = db.select().from(documents);

//     // Add filter for tags if provided
//     if (tags) {
//       // const tagsArray = Array.isArray(tags) ? tags : [tags];
//       // query.where(arrayContains(documents.tags, tagsArray));
//       query.where(arrayContains(documents.tags, ["finance", "report", "Q2", "2024"]));
//     }

//     // Add filter for metadata if provided
//     // if (metadata) {
//     //   const metadataObj = JSON.parse(metadata as string);
//     //   Object.keys(metadataObj).forEach((key) => {
//     //     query.where(eq(documents.metadata[key], metadataObj[key]));
//     //   });
//     // }

//     // Add filter for title if provided
//     if (title) {
//       query.where(ilike(documents.title, `%${title}%`));
//     }

//     // Add filter for author if provided
//     if (author) {
//       query.where(ilike(documents.author, `%${author}%`));
//     }

//     const results = await query;
//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred while searching." });
//   }
// });


//Attempt to only make tags work 

// router.get("/search", async (req, res) => {
//   const { tags, title, author } = req.query;

//   try {
//     const query = db.select().from(documents);

//     // Dynamically use tags provided in the API URL
//     if (tags) {
//       const tagsArray = Array.isArray(tags) ? tags : [tags];
//       query.where(arrayContains(documents.tags as any, tagsArray as any));
//     }

//     // Filter by title if provided
//     if (title) {
//       query.where(ilike(documents.title, `%${title}%`));
//     }

//     // Filter by author if provided
//     if (author) {
//       query.where(ilike(documents.author, `%${author}%`));
//     }

//     const results = await query;
//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred while searching." });
//   }
// });

router.get("/search",authorizeRole("Admin"), async (req, res) => {
  const { tags, title, author, metadata } = req.query;

  try {
    const query = db.select().from(documents);

    // Dynamically use tags provided in the API URL
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      query.where(arrayContains(documents.tags as any, tagsArray as any));
    }

    // Filter by title if provided
    if (title) {
      query.where(ilike(documents.title, `%${title}%`));
    }

    // Filter by author if provided
    if (author) {
      query.where(ilike(documents.author, `%${author}%`));
    }

    // Filter by metadata if provided
    if (metadata) {
      const metadataObj = JSON.parse(metadata as string);
      Object.keys(metadataObj).forEach((key) => {
        query.where(eq((documents.metadata as any)[key], metadataObj[key]));
      });
    }

    const results = await query;
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while searching." });
  }
});



export default router;
