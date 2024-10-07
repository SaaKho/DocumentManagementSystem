// src/factories/EntityFactory.ts
import { Document } from "../entities/Document";
import { User } from "../entities/User"; // Assuming you have a User entity
import { Permission } from "../entities/Permission";

export class EntityFactory {
  // Static factory method for creating Document
  static createDocument(
    id: string, // Add id to the Document creation
    fileName: string,
    fileExtension: string,
    contentType: string,
    tags: string[] = []
  ): Document {
    return new Document(
      id, // Pass id to the Document constructor
      fileName,
      fileExtension,
      contentType,
      tags,
      new Date(),
      new Date()
    );
  }

  // Static factory method for creating User without id (for creation)
  static createUser(
    username: string,
    email: string,
    password: string,
    role: string
  ): User {
    return new User(username, email, password, role);
  }

  // Static factory method for creating User with id (for existing users)
  static createExistingUser(
    id: string,
    username: string,
    email: string,
    password: string,
    role: string
  ): User {
    const user = new User(username, email, password, role);
    user.setId(id); // Assuming you have a method to set the ID in your User entity
    return user;
  }

  // Static factory method for creating Permission
  static createPermission(
    userId: string,
    documentId: string,
    permissionType: string
  ): Permission {
    return new Permission(userId, documentId, permissionType);
  }
}
