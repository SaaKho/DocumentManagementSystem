export class Document {
  private id: string; // Add id field
  private fileName: string;
  private fileExtension: string;
  private contentType: string;
  private tags: string[];
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string, // Include id in the constructor
    fileName: string,
    fileExtension: string,
    contentType: string,
    tags: string[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.fileName = fileName;
    this.fileExtension = fileExtension;
    this.contentType = contentType;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters
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

  // Setters (with encapsulation logic)
  public setFileName(fileName: string): void {
    if (!fileName || fileName.length === 0) {
      throw new Error("File name cannot be empty.");
    }
    this.fileName = fileName;
    this.updateTimestamp();
  }

  public setFileExtension(fileExtension: string): void {
    if (!fileExtension || fileExtension.length === 0) {
      throw new Error("File extension cannot be empty.");
    }
    this.fileExtension = fileExtension;
    this.updateTimestamp();
  }

  public setContentType(contentType: string): void {
    if (!contentType || contentType.length === 0) {
      throw new Error("Content type cannot be empty.");
    }
    this.contentType = contentType;
    this.updateTimestamp();
  }

  public setTags(tags: string[]): void {
    this.tags = tags;
    this.updateTimestamp();
  }

  // Method to update the 'updatedAt' field
  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
