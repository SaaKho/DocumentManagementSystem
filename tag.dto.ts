// src/repository/interfaces/tag.dto.ts

// DTO for adding or removing tags from a document
export interface TagDTO {
    documentId: string;
    tagName: string;
  }
  
  // DTO for updating an existing tag
  export interface UpdateTagDTO {
    documentId: string;
    oldTagName: string;
    newTagName: string;
  }
  