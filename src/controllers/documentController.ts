import { Request, Response } from "express";
import {
  getDocumentByIdService,
  getAllDocumentsService,
  createNewDocumentService,
  uploadDocumentService,
  deleteDocumentService,
} from "../services/documentService";

//Making a class of DocumentController

export class DocumentController {
  DocumentController() {}

  async getDocument(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const document = await getDocumentByIdService(id);
      res.status(200).json({
        message: "Document retrieved successfully",
        document,
      });
    } catch (error: any) {
      if (error.message === "Document not found") {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error retrieving document:", error);
        res.status(500).json({ error: "Failed to retrieve document" });
      }
    }
  }
  async getAllDocuments(req: Request, res: Response) {
    try {
      const allDocuments = await getAllDocumentsService();
      res.status(200).json({
        message: "Documents retrieved successfully",
        documents: allDocuments,
      });
    } catch (error: any) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  }
  async createNewDocument(req: Request, res: Response) {
    const { fileName, fileExtension, contentType, tags } = req.body;

    if (!fileName || !fileExtension || !contentType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { newDocument, fullFilePath } = await createNewDocumentService(
        fileName,
        fileExtension,
        contentType,
        tags
      );

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

  async uploadDocument(req: Request, res: Response) {
    const { tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const { newDocument, filePath } = await uploadDocumentService(
        file,
        tags ? tags.split(",") : []
      );

      res.status(201).json({
        message: "Document uploaded successfully",
        document: newDocument,
        filePath: filePath,
      });
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
  async deleteDocument(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await deleteDocumentService(id);
      return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ error: "Failed to delete document" });
    }
  }
}

