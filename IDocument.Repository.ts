import {
  CreateDocumentDTO,
  UpdateDocumentDTO,
} from "./document.dto";
import { Document } from "../../entities/Document";

export interface IDocumentRepository {
  findDocumentById(documentId: string): Promise<CreateDocumentDTO | null>;
  createDocument(documentData: Document): Promise<CreateDocumentDTO | null>;
  updateDocument(
    documentId: string,
    updates: UpdateDocumentDTO
  ): Promise<UpdateDocumentDTO | null>;
  deleteDocument(documentId: string): Promise<boolean>;

  // Add assignOwnerPermission to the interface
  assignOwnerPermission(documentId: string | undefined, userId: string): Promise<void>;
}
