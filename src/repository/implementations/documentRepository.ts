// src/repository/implementations/documentRepository.ts
import { db, documents, permissions } from "../../drizzle/schema";
import { IDocumentRepository } from "../interfaces/IDocument.Repository";
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

  async findDocumentById(documentId: string): Promise<Document | null> {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (!document[0]) {
      return null;
    }

    const foundDocument = document[0];
    return new Document(
      foundDocument.id,
      foundDocument.fileName,
      foundDocument.fileExtension,
      foundDocument.contentType,
      foundDocument.tags || [],
      foundDocument.createdAt ? new Date(foundDocument.createdAt) : new Date(),
      foundDocument.updatedAt ? new Date(foundDocument.updatedAt) : new Date()
    );
  }

  async createDocument(documentData: Document): Promise<Document | null> {
    const id = uuidv4();

    const newDocument = await db
      .insert(documents)
      .values({
        id,
        fileName: documentData.getFileName(),
        fileExtension: documentData.getFileExtension(),
        contentType: documentData.getContentType(),
        tags: documentData.getTags() || [],
        createdAt: documentData.getCreatedAt() || new Date(),
        updatedAt: documentData.getUpdatedAt() || new Date(),
      })
      .returning()
      .execute();

    if (!newDocument[0]) {
      return null;
    }

    return new Document(
      newDocument[0].id,
      newDocument[0].fileName,
      newDocument[0].fileExtension,
      newDocument[0].contentType,
      newDocument[0].tags || [],
      newDocument[0].createdAt
        ? new Date(newDocument[0].createdAt)
        : new Date(),
      newDocument[0].updatedAt ? new Date(newDocument[0].updatedAt) : new Date()
    );
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
    const updatedDocument = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, documentId))
      .returning()
      .execute();

    if (!updatedDocument[0]) {
      return null;
    }

    return new Document(
      updatedDocument[0].id,
      updatedDocument[0].fileName,
      updatedDocument[0].fileExtension,
      updatedDocument[0].contentType,
      updatedDocument[0].tags || [],
      updatedDocument[0].createdAt
        ? new Date(updatedDocument[0].createdAt)
        : new Date(),
      updatedDocument[0].updatedAt
        ? new Date(updatedDocument[0].updatedAt)
        : new Date()
    );
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, documentId))
      .execute();

    return result?.rowCount ? result.rowCount > 0 : false;
  }
}
