import { User } from "../interfaces/user.dto"; // Import User DTO

export interface IPermissionRepository {
  sharePermission(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<void>;
  findUserByEmail(email: string): Promise<User | null>; // Return User DTO instead of SharePermissionDTO
  updatePermission(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<void>;
}
