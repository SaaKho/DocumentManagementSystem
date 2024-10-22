// src/factories/DocumentFactory.ts
import { Document } from "../entities/Document";

export class DocumentFactory {
  static create(
    fileName: string,
    fileExtension: string,
    contentType: string,
    tags: string[] = []
  ): Document {
    return new Document(fileName, fileExtension, contentType, tags);
  }
}
