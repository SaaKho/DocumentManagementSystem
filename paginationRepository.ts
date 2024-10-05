import { db, documents, users } from "../../drizzle/schema";
import { IPaginationRepository } from "../interfaces/Ipagination.repository";
import { Document } from "../../entities/Document";
import { User } from "../../entities/User";

export class PaginationRepository implements IPaginationRepository {
  // Fetch paginated documents (pagination logic handled here)
  async getPaginatedDocuments(
    page: number,
    limit: number
  ): Promise<{ data: Document[]; totalItems: number }> {
    const offset = (page - 1) * limit;

    // Query to get total number of documents
    const totalItemsQuery = await db.select().from(documents);
    const totalItems = totalItemsQuery.length; // Calculate total items from the query result

    // Query to get paginated data
    const paginatedData = await db
      .select()
      .from(documents)
      .limit(limit)
      .offset(offset)
      .execute();

    // Map the paginated data to Document instances
    const documentsData = paginatedData.map(
      (doc) =>
        new Document(
          doc.fileName,
          doc.fileExtension,
          doc.contentType,
          doc.tags || [], // Use an empty array if null
          doc.createdAt || new Date(), // Default to current date if null
          doc.updatedAt || new Date() // Default to current date if null
        )
    );

    return {
      data: documentsData,
      totalItems,
    };
  }

  // Fetch paginated users (pagination logic handled here)
  async getPaginatedUsers(
    page: number,
    limit: number
  ): Promise<{ data: User[]; totalItems: number }> {
    const offset = (page - 1) * limit;

    // Query to get total number of users
    const totalItemsQuery = await db.select().from(users);
    const totalItems = totalItemsQuery.length; // Calculate total items from the query result

    // Query to get paginated data
    const paginatedData = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .execute();

    // Map the paginated data to User instances
    const usersData = paginatedData.map(
      (userRecord) =>
        new User(
          userRecord.id,
          userRecord.username,
          userRecord.email,
          userRecord.password,
          userRecord.role
        )
    );

    return {
      data: usersData,
      totalItems,
    };
  }
}
