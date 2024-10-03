// src/repository/interfaces/download.dto.ts

// DTO for generating a download link
export interface GenerateDownloadLinkDTO {
    filename: string;
    protocol: string;
    host: string;
  }
  
  // DTO for serving file by token
  export interface ServeFileDTO {
    token: string;
  }
  