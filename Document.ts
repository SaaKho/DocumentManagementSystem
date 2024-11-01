// src/domain/entities/Document.ts

export class Document {
  private id: string;
  private fileName: string;
  private fileExtension: string;
  private contentType: string;
  private tags: string[];
  private createdAt: Date;
  private updatedAt: Date;
  private filePath: string;

  constructor(
    id: string,
    fileName: string,
    fileExtension: string,
    contentType: string,
    tags: string[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    filePath: string = ""
  ) {
    // Inline validations in constructor
    if (!id || id.length === 0) {
      throw new Error("ID cannot be empty.");
    }
    if (!fileName || fileName.length === 0) {
      throw new Error("File name cannot be empty.");
    }
    if (!fileExtension || fileExtension.length === 0) {
      throw new Error("File extension cannot be empty.");
    }
    if (!contentType || contentType.length === 0) {
      throw new Error("Content type cannot be empty.");
    }

    this.id = id;
    this.fileName = fileName;
    this.fileExtension = fileExtension;
    this.contentType = contentType;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.filePath = filePath;
  }

  // Update methods
  public updateFileName(newFileName: string): void {
    if (!newFileName || newFileName.length === 0) {
      throw new Error("File name cannot be empty.");
    }
    this.fileName = newFileName;
    this.updateTimestamp();
  }

  public updateFileExtension(newFileExtension: string): void {
    if (!newFileExtension || newFileExtension.length === 0) {
      throw new Error("File extension cannot be empty.");
    }
    this.fileExtension = newFileExtension;
    this.updateTimestamp();
  }

  public updateContentType(newContentType: string): void {
    if (!newContentType || newContentType.length === 0) {
      throw new Error("Content type cannot be empty.");
    }
    this.contentType = newContentType;
    this.updateTimestamp();
  }

  public updateTags(newTags: string[]): void {
    this.tags = newTags;
    this.updateTimestamp();
  }

  public setFilePath(filePath: string): void {
    this.filePath = filePath;
    this.updateTimestamp();
  }

  // Private method to update timestamp
  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  // Getters for properties
  public getId(): string {
    return this.id;
  }

  public getFileName(): string {
    return this.fileName;
  }

  public getFileExtension(): string {
    return this.fileExtension;
  }

  public getContentType(): string {
    return this.contentType;
  }

  public getTags(): string[] {
    return this.tags;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getFilePath(): string {
    return this.filePath;
  }
}
