// src/repository/interfaces/search.dto.ts

// DTO for search queries
export interface AdvancedSearchDTO {
  tags?: string;
  fileName?: string;
  contentType?: string;
}

// DTO for document search results
export interface SearchResultDTO {
  id: string;
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}
