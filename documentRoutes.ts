import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { db, documents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { authPlugins } from "mysql2";

const router = express.Router();

// Apply the auth middleware to all routes
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the path to the 'uploads' folder inside the 'src' directory
    const uploadsDir = path.join(__dirname, "../../uploads"); // Move up two levels to reach the 'src' folder

    // Check if the directory exists
    if (!fs.existsSync(uploadsDir)) {
      // If the directory does not exist, create it
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Specify the uploads directory as the destination for file storage
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded document
    const filename = `document_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

//Get all documents
//Tested and working
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
//Tested and working
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

// Create a new document
//Tested and working
router.post(
  "/createNewDocument",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { fileName, fileExtension, contentType, tags } = req.body;

    if (!fileName || !fileExtension || !contentType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const documentsDir = path.join(__dirname, "../../documents");
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }

      const fullFilePath = path.join(
        documentsDir,
        `${fileName}${fileExtension}`
      );

      fs.writeFileSync(fullFilePath, "", "utf8");

      // Ensure tags is an array
      const tagsArray = Array.isArray(tags) ? tags : tags.split(",");

      const newDocument = await db
        .insert(documents)
        .values({
          id: uuidv4(),
          fileName,
          fileExtension,
          contentType,
          tags: tagsArray,
        })
        .returning();

      res.status(201).json({
        message: "Document created successfully",
        document: newDocument,
        filePath: fullFilePath,
      });
    } catch (error: any) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  }
);

// Endpoint to upload a document with metadata
//Tested and working
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
        filePath: path.join(__dirname, "../../uploads", file.filename), // Ensure correct path
      });
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// Delete a document by ID
//Tested and working
router.delete(
  "/deleteDocument/:id",
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const existingDocument = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .execute();

      if (existingDocument.length === 0) {
        return res.status(404).json({ message: "Document not found" });
      }

      await db.delete(documents).where(eq(documents.id, id)).execute();

      const filePath = path.join(
        __dirname,
        "../uploads",
        `${existingDocument[0].fileName}${existingDocument[0].fileExtension}`
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ error: "Failed to delete document" });
    }
  }
);

export default router;
