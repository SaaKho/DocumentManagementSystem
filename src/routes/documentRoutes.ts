import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { db, documents } from "../drizzle/schema";
import { arrayContains, eq, ilike } from "drizzle-orm";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";
import multer from "multer";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

// Apply the auth middleware to all routes
router.use(authMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const filename = `document_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

//Get all documents
router.get("/getAllDocuments", async (req: Request, res: Response) => {
  try {
    const allDocuments = await db.select().from(documents).execute();

    res.status(200).json({
      message: "Documents retrieved successfully",
      documents: allDocuments,
    });
  } catch (error: any) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
});

//Get Document by Id
router.get("/getDocument/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .execute();

    if (document.length > 0) {
      res.status(200).json({
        message: "Document retrieved successfully",
        document: document[0],
      });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error: any) {
    console.error("Error retrieving document:", error);
    res.status(500).json({ error: "Failed to retrieve document" });
  }
});

router.post("/createDocument", async (req: Request, res: Response) => {
  const { fileName, fileExtension, contentType, tags } = req.body;

  // Simple validation
  if (!fileName || !fileExtension || !contentType) {
    return res.status(400).json({
      error: "fileName, fileExtension, and contentType are required.",
    });
  }

  try {
    // Insert the new document into the database
    const newDocument = await db
      .insert(documents)
      .values({
        id: uuidv4(), // UUID generated for the document ID
        fileName,
        fileExtension,
        contentType,
        tags: tags ? tags.split(",") : [], // Split tags if passed as a comma-separated string
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Respond with the created document metadata
    return res.status(201).json({
      message: "Document created successfully",
      document: newDocument,
    });
  } catch (error: any) {
    console.error("Error creating document:", error);
    return res.status(500).json({ error: "Failed to create document" });
  }
});

router.post("/createNewDocument", async (req: Request, res: Response) => {
  const { fileName, fileExtension, contentType, tags } = req.body;

  // Validate the input
  if (!fileName || !fileExtension || !contentType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Ensure the documents directory exists
    const documentsDir = path.join(__dirname, "../documents");
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    // Create the full file path
    const fullFilePath = path.join(documentsDir, `${fileName}${fileExtension}`);

    // Create an empty file at the specified path
    fs.writeFileSync(fullFilePath, "", "utf8");

    // Insert the document metadata into the database
    const newDocument = await db
      .insert(documents)
      .values({
        id: uuidv4(), // Generate a unique UUID for the document
        fileName,
        fileExtension,
        contentType,
        tags: tags || [], // Use an empty array if no tags are provided
      })
      .returning();

    // Respond with the newly created document metadata
    res.status(201).json({
      message: "Document created successfully",
      document: newDocument,
      filePath: fullFilePath, // Return the file path for reference
    });
  } catch (error: any) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// Endpoint to upload a document with metadata
router.post(
  "/uploadDocument",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { title, author, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const metadata = {
        fileName: path.parse(file.originalname).name,
        fileExtension: path.extname(file.originalname),
        contentType: file.mimetype,
        tags: tags ? tags.split(",") : [],
      };

      const newDocument = await db
        .insert(documents)
        .values(metadata)
        .returning();

      res.status(201).json({
        message: "Document uploaded successfully",
        document: newDocument,
        filePath: path.join(__dirname, "../uploads", file.filename),
      });
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// Update a document by ID
router.put("/updateDocument/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fileName, fileExtension, contentType, tags, content } = req.body;

  // Validate the input
  if (!fileName || !fileExtension || !contentType) {
    return res.status(400).json({
      error: "fileName, fileExtension, and contentType are required.",
    });
  }

  try {
    // Ensure the document exists
    const existingDocument = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .execute();

    if (existingDocument.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Update the document metadata
    const updatedDocument = await db
      .update(documents)
      .set({
        fileName,
        fileExtension,
        contentType,
        tags: tags ? tags.split(",") : [],
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    // Respond with the updated document metadata
    return res.status(200).json({
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } catch (error: any) {
    console.error("Error updating document:", error);
    return res.status(500).json({ error: "Failed to update document" });
  }
});

// Delete a document by ID
router.delete("/deleteDocument/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Ensure the document exists
    const existingDocument = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .execute();

    if (existingDocument.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the document from the database
    await db.delete(documents).where(eq(documents.id, id)).execute();

    // Optionally, delete the actual file from the uploads folder
    const filePath = path.join(
      __dirname,
      "../uploads",
      `${existingDocument[0].fileName}${existingDocument[0].fileExtension}`
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Deletes the file
    }

    // Respond with a success message
    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ error: "Failed to delete document" });
  }
});

// Add a new tag to a document
router.post(
  "/document/:documentId/tag",
  async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { key, name } = req.body;

    if (!key || !name) {
      return res
        .status(400)
        .json({ error: "Both 'key' and 'name' are required." });
    }

    try {
      // Find the document by ID
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .execute();

      if (document.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Get existing tags and add the new tag
      const existingTags = document[0].tags || [];
      const newTag = `${key}:${name}`;

      // Check for duplicate tag
      if (existingTags.includes(newTag)) {
        return res
          .status(409)
          .json({ error: "Tag with the same key and name already exists." });
      }

      existingTags.push(newTag);

      // Update the document with the new tags
      const updatedDocument = await db
        .update(documents)
        .set({ tags: existingTags })
        .where(eq(documents.id, documentId))
        .returning();

      // Respond with the updated document
      res.status(200).json({
        message: "Tag added successfully",
        document: updatedDocument[0],
      });
    } catch (error: any) {
      console.error("Error adding tag:", error);
      res.status(500).json({ error: "Failed to add tag" });
    }
  }
);

// Update an existing tag in a document
router.put("/document/:documentId/tag", async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { oldKey, oldName, newKey, newName } = req.body;

  if (!oldKey || !oldName || !newKey || !newName) {
    return res.status(400).json({
      error:
        "All fields ('oldKey', 'oldName', 'newKey', 'newName') are required.",
    });
  }

  try {
    // Find the document by ID
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (document.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Get existing tags and find the tag to update
    const existingTags = document[0].tags || [];
    const oldTag = `${oldKey}:${oldName}`;
    const newTag = `${newKey}:${newName}`;

    const tagIndex = existingTags.indexOf(oldTag);

    if (tagIndex === -1) {
      return res.status(404).json({ error: "Tag not found." });
    }

    // Update the tag
    existingTags[tagIndex] = newTag;

    // Update the document with the updated tags
    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning();

    // Respond with the updated document
    res.status(200).json({
      message: "Tag updated successfully",
      document: updatedDocument[0],
    });
  } catch (error: any) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
});

// Delete a tag from a document
router.delete(
  "/document/:documentId/tag",
  async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { key, name } = req.body;

    if (!key || !name) {
      return res
        .status(400)
        .json({ error: "Both 'key' and 'name' are required." });
    }

    try {
      // Find the document by ID
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .execute();

      if (document.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Get existing tags and find the tag to delete
      const existingTags = document[0].tags || [];
      const tagToDelete = `${key}:${name}`;

      const tagIndex = existingTags.indexOf(tagToDelete);

      if (tagIndex === -1) {
        return res.status(404).json({ error: "Tag not found." });
      }

      // Remove the tag
      existingTags.splice(tagIndex, 1);

      // Update the document with the remaining tags
      const updatedDocument = await db
        .update(documents)
        .set({ tags: existingTags })
        .where(eq(documents.id, documentId))
        .returning();

      // Respond with the updated document
      res.status(200).json({
        message: "Tag deleted successfully",
        document: updatedDocument[0],
      });
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
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
      // Check if the file exists in either the 'uploads' or 'documents' directory
      let filePath = path.join(__dirname, "../uploads", filename);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, "../documents", filename);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: "File not found" });
        }
      }

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
      console.error("Error generating download link:", error);
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

      // Search in both 'uploads' and 'documents' directories
      let filePath = path.join(__dirname, "../uploads", decoded.filename);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, "../documents", decoded.filename);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: "File not found" });
        }
      }

      res.download(filePath);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Download link has expired" });
      }
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  }
);

export default router;
