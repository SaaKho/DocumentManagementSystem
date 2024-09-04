import { db, documents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export class DocumentRepository {
  async getAllDocuments() {
    return await db.select().from(documents).execute();
  }

  async getDocumentById(id: string) {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .execute();
    return document.length > 0 ? document[0] : null;
  }

  async createDocument(data: any) {
    return await db.insert(documents).values(data).returning();
  }

  async deleteDocument(id: string) {
    return await db.delete(documents).where(eq(documents.id, id)).execute();
  }
}
