import { db, documents, permissions } from "../../drizzle/schema";
import { IDocumentRepository } from "../interfaces/IDocument.Repository";
import {
  CreateDocumentDTO,
  UpdateDocumentDTO,
  UploadDocumentDTO,
} from "../interfaces/document.dto";
import { Document } from "../../entities/Document";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class DocumentRepository implements IDocumentRepository {
  async assignOwnerPermission(
    documentId: string,
    userId: string
  ): Promise<void> {
    await db
      .insert(permissions)
      .values({
        id: uuidv4(),
        documentId,
        userId,
        permissionType: "Owner",
      })
      .execute();
  }
  // Find a document by ID
  async findDocumentById(
    documentId: string
  ): Promise<CreateDocumentDTO | null> {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    return document[0];
  }

  // Create a new document
  async createDocument(
    documentData: Document
  ): Promise<CreateDocumentDTO | null> {
    const id = uuidv4();

    const newDocument = await db
      .insert(documents)
      .values({
        id,
        fileName: documentData.getFileName(),
        fileExtension: documentData.getFileExtension(),
        contentType: documentData.getContentType(),
        tags: documentData.getTags() || [],
      })
      .returning()
      .execute();

    return newDocument[0];
  }

  // Update a document's details
  async updateDocument(
    documentId: string,
    updates: UpdateDocumentDTO
  ): Promise<UpdateDocumentDTO | null> {
    const updatedDocument = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, documentId))
      .returning()
      .execute();

    return updatedDocument[0];
  }

  // Delete a document
  async deleteDocument(documentId: string): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, documentId))
      .execute();

    // Check if 'result' and 'result.rowCount' are not null or undefined
    return result?.rowCount ? result.rowCount > 0 : false;
  }
  async uploadDocument(
    fileData: UploadDocumentDTO
  ): Promise<CreateDocumentDTO | null> {
    const id = uuidv4();

    const newDocument = await db
      .insert(documents)
      .values({
        id,
        fileName: fileData.fileName,
        fileExtension: fileData.fileExtension,
        contentType: fileData.contentType,
        tags: fileData.tags || [], // Ensure tags are always an array
      })
      .returning()
      .execute();

    return {
      id,
      fileName: newDocument[0].fileName,
      fileExtension: newDocument[0].fileExtension,
      contentType: newDocument[0].contentType,
      tags: newDocument[0].tags || [], // Ensure empty array if no tags
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
