// src/application/dtos/DocumentDTO.ts
import { z } from "zod";
import { BaseDto } from "@carbonteq/hexapp";
import { DocumentData } from "../../domain/entities/Document";

export interface DocumentDTO {
  id: string;
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  filePath: string;
}

// export interface CreateDocumentDTO {
//   userId: string;
//   fileName: string;
//   fileExtension: string;
//   contentType: string;
//   tags?: string[];
// }

export interface UpdateDocumentDTO {
  fileName?: string;
  fileExtension?: string;
  contentType?: string;
  tags?: string[];
  filePath?: string;
}

export interface UploadDocumentDTO {
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[];
  userId: string;
  documentId: string;
  filePath: string;
}

export class DocumentCreateDTO extends BaseDto {
  private static readonly schema = z.object({
    userId: z.string(),
    fileName: z.string(),
    fileExtension: z.string(),
    contentType: z.string(),
    tags: z.array(z.string()),
    filePath: z.string(),
  });

  private constructor(readonly data: Readonly<DocumentData>) {
    super();
  }
  static create(data: unknown) {
    return BaseDto.validate(DocumentCreateDTO.schema, data).map(
      (parsed) => new DocumentCreateDTO(parsed)
    );
  }
}
