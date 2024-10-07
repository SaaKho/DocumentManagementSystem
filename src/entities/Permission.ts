export class Permission {
  private userId: string;
  private documentId: string;
  private permissionType: string;

  constructor(userId: string, documentId: string, permissionType: string) {
    this.userId = userId;
    this.documentId = documentId;
    this.permissionType = permissionType;
  }

  // Getters
  public getUserId(): string {
    return this.userId;
  }

  public getDocumentId(): string {
    return this.documentId;
  }

  public getPermissionType(): string {
    return this.permissionType;
  }

  // Setters (with validation logic)
  public setUserId(userId: string): void {
    if (!userId || userId.length === 0) {
      throw new Error("User ID cannot be empty.");
    }
    this.userId = userId;
  }

  public setDocumentId(documentId: string): void {
    if (!documentId || documentId.length === 0) {
      throw new Error("Document ID cannot be empty.");
    }
    this.documentId = documentId;
  }

  public setPermissionType(permissionType: string): void {
    const validPermissionTypes = ["Owner", "Editor", "Viewer"]; // Example valid types
    if (!validPermissionTypes.includes(permissionType)) {
      throw new Error(`Invalid permission type. Allowed values: ${validPermissionTypes.join(", ")}`);
    }
    this.permissionType = permissionType;
  }
  
}
