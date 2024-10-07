// src/controllers/documentController.ts
import { Response } from "express";
import { DocumentService } from "../services/documentService";
import { documentSchema } from "../validation/documentvalidation";
import { AuthenticatedRequest } from "@middleware/authMiddleware";

export class DocumentController {
  private static documentService: DocumentService;

  static setDocumentService(service: DocumentService) {
    this.documentService = service;
  }

  static createNewDocument = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const validation = documentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validation.error.errors,
        });
      }

      const { fileName, fileExtension, contentType, tags } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const tagsArray = Array.isArray(tags) ? tags : tags.split(",");
      const newDocument = await this.documentService.createDocument(
        userId,
        fileName,
        fileExtension || "",
        contentType,
        tagsArray
      );

      res.status(201).json({
        message: "Document created successfully",
        document: newDocument,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create document" });
    }
  };

  static getDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { documentId } = req.params;
      const document = await this.documentService.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json({ document });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve document" });
    }
  };

  static updateDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { documentId } = req.params;
      const { fileName, fileExtension, contentType, tags } = req.body;

      const updatedDocument = await this.documentService.updateDocument(
        documentId,
        {
          fileName,
          fileExtension,
          contentType,
          tags: Array.isArray(tags) ? tags : tags.split(","),
        }
      );

      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json({
        message: "Document updated successfully",
        document: updatedDocument,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  };

  static deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { documentId } = req.params;
      await this.documentService.deleteDocument(documentId);
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  };

  static uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = file.originalname;
      const fileExtension = file.originalname.split(".").pop() || "";
      const contentType = file.mimetype;
      const tags = req.body.tags ? req.body.tags.split(",") : [];

      const newDocument = await this.documentService.uploadDocument(
        fileName,
        fileExtension,
        contentType,
        tags,
        userId
      );

      res.status(201).json({
        message: "Document uploaded successfully",
        documentId: newDocument.getId(),
        document: newDocument,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload document" });
    }
  };
}
