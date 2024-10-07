import { ITagRepository } from "../repository/interfaces/Itag.repository";
import { Document } from "../entities/Document";
import { Logger } from "../logging/logger";

export class TagService {
  private tagRepository: ITagRepository;
  private logger: Logger;

  constructor(tagRepository: ITagRepository, logger: Logger) {
    this.tagRepository = tagRepository;
    this.logger = logger;
  }

  async addNewTag(documentId: string, tagName: string): Promise<Document> {
    this.logger.log(`Adding new tag '${tagName}' to document: ${documentId}`);
    try {
      const updatedDocument = await this.tagRepository.addTag(
        documentId,
        tagName
      );
      this.logger.log(
        `Tag '${tagName}' added successfully to document: ${documentId}`
      );
      return updatedDocument;
    } catch (error: any) {
      this.logger.error(
        `Error adding tag '${tagName}' to document: ${error.message}`
      );
      throw error;
    }
  }

  async updateTag(
    documentId: string,
    oldTagName: string,
    newTagName: string
  ): Promise<Document> {
    this.logger.log(
      `Updating tag from '${oldTagName}' to '${newTagName}' on document: ${documentId}`
    );
    try {
      const updatedDocument = await this.tagRepository.updateTag(
        documentId,
        oldTagName,
        newTagName
      );
      this.logger.log(
        `Tag updated successfully from '${oldTagName}' to '${newTagName}' on document: ${documentId}`
      );
      return updatedDocument;
    } catch (error: any) {
      this.logger.error(`Error updating tag on document: ${error.message}`);
      throw error;
    }
  }

  async deleteTag(documentId: string, tagName: string): Promise<Document> {
    this.logger.log(`Deleting tag '${tagName}' from document: ${documentId}`);
    try {
      const updatedDocument = await this.tagRepository.deleteTag(
        documentId,
        tagName
      );
      this.logger.log(
        `Tag '${tagName}' deleted successfully from document: ${documentId}`
      );
      return updatedDocument;
    } catch (error: any) {
      this.logger.error(
        `Error deleting tag '${tagName}' from document: ${error.message}`
      );
      throw error;
    }
  }
}
