// src/repository/interfaces/IPagination.Repository.ts
import { Document } from "./document.dto";
import { User } from "./user.dto";

// Pagination interface to handle paginated data
export interface IPaginationRepository {
  getPaginatedDocuments(
    page: number,
    limit: number
  ): Promise<{ data: Document[]; totalItems: number }>;

  getPaginatedUsers(
    page: number,
    limit: number
  ): Promise<{ data: User[]; totalItems: number }>;
}
