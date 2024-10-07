import { Document } from "../../entities/Document";

export interface ITagRepository {
  addTag(documentId: string, tagName: string): Promise<Document>;
  updateTag(
    documentId: string,
    oldTagName: string,
    newTagName: string
  ): Promise<Document>;
  deleteTag(documentId: string, tagName: string): Promise<Document>;
}
