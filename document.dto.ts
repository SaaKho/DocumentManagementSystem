// src/repository/interfaces/document.dto.ts

// DTO for uploading a document
export interface UploadDocumentDTO {
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[] | null;
}

// DTO for creating or uploading a document
export interface CreateDocumentDTO {
  id: string;
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// DTO for updating a document
export interface UpdateDocumentDTO {
  fileName?: string;
  fileExtension?: string;
  contentType?: string;
  tags?: string[] | null;
  createdAt?: Date | null;  
  updatedAt?: Date | null; 
}


// // DTO for the document object returned from the database
export interface GetDocumentDTO {
  id: string;
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
