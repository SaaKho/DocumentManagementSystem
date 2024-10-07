import { db, documents } from "../../drizzle/schema";
import { ITagRepository } from "../interfaces/Itag.repository";
import { eq } from "drizzle-orm";
import { Document } from "../../entities/Document";

export class TagRepository implements ITagRepository {
  async addTag(documentId: string, tagName: string): Promise<Document> {
    const documentData = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (documentData.length === 0) {
      throw new Error("Document not found");
    }

    const existingTags = documentData[0].tags || [];
    if (existingTags.includes(tagName)) {
      throw new Error("Tag already exists.");
    }

    existingTags.push(tagName);

    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning()
      .execute();

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

  async updateTag(
    documentId: string,
    oldTagName: string,
    newTagName: string
  ): Promise<Document> {
    const documentData = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (documentData.length === 0) {
      throw new Error("Document not found");
    }

    const existingTags = documentData[0].tags || [];
    const tagIndex = existingTags.indexOf(oldTagName);
    if (tagIndex === -1) {
      throw new Error("Tag not found.");
    }

    existingTags[tagIndex] = newTagName;

    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning()
      .execute();

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

  async deleteTag(documentId: string, tagName: string): Promise<Document> {
    const documentData = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (documentData.length === 0) {
      throw new Error("Document not found");
    }

    const existingTags = documentData[0].tags || [];
    const tagIndex = existingTags.indexOf(tagName);

    if (tagIndex === -1) {
      throw new Error("Tag not found.");
    }

    existingTags.splice(tagIndex, 1);

    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning()
      .execute();

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
}
