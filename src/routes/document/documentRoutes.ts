// src/routes/DocumentRoutes.ts
import express from "express";
import {
  authMiddleware,
  adminMiddleware,
  roleMiddleware,
} from "../../middleware/authMiddleware";
import multer from "multer";
import { DocumentService } from "../../services/documentService";
import { DocumentController } from "../../controllers/documentController";
import { DocumentRepository } from "../../repository/implementations/documentRepository";
import { ConsoleLogger } from "../../logging/consoleLogger";

const router = express.Router();

// Initialize repository, logger, and service
const documentRepository = new DocumentRepository();
const logger = new ConsoleLogger(); 
const documentService = new DocumentService(documentRepository, logger); // Inject logger into service
DocumentController.setDocumentService(documentService);

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads"); // Ensure this path is correct
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/create", authMiddleware, DocumentController.createNewDocument);
router.get(
  "/getDocument/:documentId",
  authMiddleware,
  roleMiddleware(["Viewer", "Editor", "Owner"]),
  DocumentController.getDocument
);
router.put(
  "/updateDocument/:documentId",
  authMiddleware,
  DocumentController.updateDocument
);
router.post(
  "/uploadDocument",
  authMiddleware,
  upload.single("file"),
  DocumentController.uploadDocument
);
router.delete(
  "/deleteDocument/:documentId",
  authMiddleware,
  DocumentController.deleteDocument
);

export default router;
