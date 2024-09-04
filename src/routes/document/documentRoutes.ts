import express from "express";
import path from "path";
import fs from "fs";
import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { DocumentController } from "../../controllers/documentController";

const router = express.Router();

const documentController = new DocumentController();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads");
    // Check if the directory exists
    if (!fs.existsSync(uploadsDir)) {
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

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadsDir = path.join(__dirname, "../../uploads");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     const id = uuidv4();
//     const filename = `document_${id}${path.extname(file.originalname)}`;
//     cb(null, filename);
//   },
// });

const upload = multer({ storage });

router.get(
  "/getAllDocuments",
  documentController.getAllDocuments.bind(documentController)
);

router.get(
  "/getDocument/:id",
  documentController.getDocument.bind(documentController)
);

// // POST create new document
// router.post("/createNewDocument", authorizeRole("Admin"), createNewDocument);
router.post(
  "/createNewDocument",
  documentController.createNewDocument.bind(documentController)
);

router.post(
  "/uploadDocument",
  upload.single("file"),
  documentController.uploadDocument.bind(documentController)
);

router.delete(
  "/deleteDocument/:id",
  documentController.deleteDocument.bind(documentController)
);

export default router;
