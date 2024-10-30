// src/repository/implementations/documentRepository.ts
import {
  db,
  documents,
  permissions,
} from "../../infrastructure/drizzle/schema";
import { IDocumentRepository } from "../../domain/interfaces/IDocument.Repository";
import { Document } from "../../domain/entities/Document";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { RepositoryResult } from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import {
  DocumentNotFoundError,
  DocumentAlreadyExistsError,
  DocumentPermissionError,
  DocumentUpdateError,
} from "../../domain/errors/document.errors";
import { injectable } from "inversify";

@injectable()
export class DocumentRepository implements IDocumentRepository {
  //Need to find another place to place this function assignOwner becasue no repo for this
  //ygm
  async assignOwnerPermission(
    documentId: string,
    userId: string
  ): Promise<RepositoryResult<void, DocumentPermissionError>> {
    try {
      await db
        .insert(permissions)
        .values({
          id: uuidv4(),
          documentId,
          userId,
          permissionType: "Owner",
        })
        .execute();

      return Result.Ok(undefined); // Success case
    } catch (error) {
      // Use AppError.InvalidOperation instead of InvalidOperation directly
      return Result.Err(new DocumentPermissionError(documentId));
    }
  }

  async findDocumentById(
    documentId: string
  ): Promise<RepositoryResult<Document, DocumentNotFoundError>> {
    try {
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .execute();

      if (!document[0]) {
        return Result.Err(new DocumentNotFoundError(documentId));
      }

      const foundDocument = document[0];
      const entity = Document.fromSerialized({
        ...foundDocument,
        tags: foundDocument.tags || [],
        createdAt: foundDocument.createdAt || new Date(),
        updatedAt: foundDocument.updatedAt || new Date(),
      });

      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new DocumentNotFoundError(documentId));
    }
  }

  async insert(
    documentData: Document
  ): Promise<RepositoryResult<Document, DocumentAlreadyExistsError>> {
    try {
      const serialized = documentData.serialize();

      const [newDocument] = await db
        .insert(documents)
        .values(serialized)
        .returning()
        .execute();

      if (!newDocument) {
        return Result.Err(new DocumentAlreadyExistsError(serialized.id));
      }

      const entity = Document.fromSerialized({
        ...newDocument,
        tags: newDocument.tags || [],
        createdAt: newDocument.createdAt || new Date(),
        updatedAt: newDocument.updatedAt || new Date(),
      });

      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new DocumentAlreadyExistsError(documentData.id));
    }
  }
  async update(
    entity: Document
  ): Promise<RepositoryResult<Document, DocumentUpdateError>> {
    try {
      const serialized = entity.serialize();
      const updatedDocument = await db
        .update(documents)
        .set(serialized)
        .where(eq(documents.id, entity.id))
        .returning()
        .execute();

      if (!updatedDocument[0]) {
        return Result.Err(new DocumentUpdateError(serialized.id));
      }

      const documentEntity = Document.fromSerialized({
        ...updatedDocument[0],
        tags: updatedDocument[0].tags || [],
        createdAt: updatedDocument[0].createdAt || new Date(),
        updatedAt: updatedDocument[0].updatedAt || new Date(),
      });

      return Result.Ok(documentEntity); // Return success case
    } catch (error: any) {
      return Result.Err(new DocumentUpdateError(entity.id));
    }
  }

  //Delete kartay hue pass the entity and return the same entity and we dont need to do the fetch waala kaam here
  async delete(
    documentId: string
  ): Promise<RepositoryResult<Document, DocumentNotFoundError>> {
    try {
      const documentResult = await this.findDocumentById(documentId);
      if (documentResult.isErr()) {
        return documentResult; // Forward the error if document is not found
      }

      const document = documentResult.unwrap(); // Unwrap the document if found
      await db.delete(documents).where(eq(documents.id, documentId)).execute();
      return Result.Ok(document); // Return the deleted document as success
    } catch (error: any) {
      return Result.Err(new DocumentNotFoundError(documentId));
    }
  }
}
