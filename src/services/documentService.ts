// src/services/DocumentService.ts
import { IDocumentRepository } from "../repository/interfaces/IDocument.Repository";
import { EntityFactory } from "../factories/entitiy.factory";
import { Logger } from "../logging/logger";
import { Document } from "../entities/Document";
import { v4 as uuidv4 } from "uuid";

export class DocumentService {
  private documentRepository: IDocumentRepository;
  private logger: Logger;
  //Dependency Injection is a design pattern in which an object or function receives its
  //dependencies from an external source rather than creating them itself. In your case, instead of the
  //DocumentService directly creating an instance of DocumentRepository, you inject it through the constructor,
  //making the service more flexible and easier to test.

  constructor(documentRepository: IDocumentRepository, logger: Logger) {
    this.documentRepository = documentRepository;
    this.logger = logger;
  }

  async createDocument(
    userId: string,
    fileName: string,
    fileExtension: string,
    contentType: string,
    tags: string[] = []
  ): Promise<Document | null> {
    this.logger.log(`Creating new document: ${fileName}.${fileExtension}`);
    const id = uuidv4();

    const newDocument = EntityFactory.createDocument(
      id,
      fileName,
      fileExtension,
      contentType,
      tags
    );

    try {
      const insertedDocument = await this.documentRepository.createDocument(
        newDocument
      );

      if (insertedDocument) {
        await this.documentRepository.assignOwnerPermission(
          insertedDocument.getId(),
          userId
        );
        this.logger.log(`Document created successfully for user: ${userId}`);
        return insertedDocument;
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Error creating document: ${error.message}`);
      throw error;
    }
  }

  async getDocument(documentId: string): Promise<Document | null> {
    this.logger.log(`Fetching document with ID: ${documentId}`);
    try {
      const document = await this.documentRepository.findDocumentById(
        documentId
      );
      if (!document) {
        this.logger.error(`Document not found with ID: ${documentId}`);
        return null;
      }
      this.logger.log(`Document retrieved successfully with ID: ${documentId}`);
      return document;
    } catch (error: any) {
      this.logger.error(`Error retrieving document: ${error.message}`);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    this.logger.log(`Deleting document with ID: ${documentId}`);
    try {
      const deleted = await this.documentRepository.deleteDocument(documentId);
      if (!deleted) {
        this.logger.error(`Failed to delete document with ID: ${documentId}`);
        throw new Error("Document not found");
      }
      this.logger.log(`Document deleted successfully with ID: ${documentId}`);
    } catch (error: any) {
      this.logger.error(`Error deleting document: ${error.message}`);
      throw error;
    }
  }
  async updateDocument(
    documentId: string,
    updates: Partial<{
      fileName: string;
      fileExtension: string;
      contentType: string;
      tags: string[];
    }>
  ): Promise<Document | null> {
    this.logger.log(`Updating document with ID: ${documentId}`);

    try {
      // Fetch the existing document
      const document = await this.documentRepository.findDocumentById(
        documentId
      );
      if (!document) {
        this.logger.error(`Document not found with ID: ${documentId}`);
        return null;
      }

      // Apply updates using the setter methods
      if (updates.fileName) document.setFileName(updates.fileName);
      if (updates.fileExtension)
        document.setFileExtension(updates.fileExtension);
      if (updates.contentType) document.setContentType(updates.contentType);
      if (updates.tags) document.setTags(updates.tags);

      // Save the updated document back to the repository
      const updatedDocument = await this.documentRepository.updateDocument(
        documentId,
        {
          fileName: document.getFileName(),
          fileExtension: document.getFileExtension(),
          contentType: document.getContentType(),
          tags: document.getTags(),
        }
      );

      return updatedDocument;
    } catch (error: any) {
      this.logger.error(`Error updating document: ${error.message}`);
      throw error;
    }
  }

  async uploadDocument(
    fileName: string,
    fileExtension: string,
    contentType: string,
    tags: string[],
    userId: string
  ): Promise<Document> {
    this.logger.log(`Uploading document: ${fileName}`);

    try {
      const id = uuidv4();
      const newDocument = EntityFactory.createDocument(
        id,
        fileName,
        fileExtension,
        contentType,
        tags
      );

      const insertedDocument = await this.documentRepository.createDocument(
        newDocument
      );

      if (!insertedDocument) {
        this.logger.error("Failed to create document");
        throw new Error("Failed to create document");
      }

      await this.documentRepository.assignOwnerPermission(
        insertedDocument.getId(),
        userId
      );

      this.logger.log(
        `Document uploaded successfully and ownership assigned to user ${userId}`
      );
      return insertedDocument;
    } catch (error: any) {
      this.logger.error(`Error uploading document: ${error.message}`);
      throw error;
    }
  }
}

//What Is Dependency Injection (DI)?
//Dependency Injection is a design pattern in which an object or function receives its dependencies
//(objects, services, repositories, etc.) from an external source rather than creating them itself. This helps in:

//Decoupling:
//Testability:
//How DI Is Used in Your Project:
//DocumentService depends on the IDocumentRepository for performing database operations.
//You're injecting the repository instance when the DocumentService is constructed. This is constructor injection,
// which is a common form of DI.

//constructor(documentRepository: IDocumentRepository) {
//this.documentRepository = documentRepository;
//}

//The Static Factory Pattern is merely responsible for creating entities (like Document, User, etc.).
//It does not affect or replace the injection of dependencies like repositories or services.

//You are not injecting the factory itself, but rather using its static methods to create objects (like Document) whenever needed.
//The DI principle is still intact because your services (like DocumentService) are not responsible for managing their
//repositories or other external dependencies. The factory is just a utility for creating objects, not a service or
//repository that needs to be injected.

//In my proj
//EntityFactory helps you create Document, User, or Permission instances, but it doesn’t interfere with how dependencies
//like IDocumentRepository are injected into the DocumentService.

//DI is still present in your architecture because the services (like DocumentService) still rely on their dependencies
//(like IDocumentRepository), which are passed into them from outside (e.g., via constructor injection).
