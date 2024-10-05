import { db, permissions, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { IPermissionRepository } from "../interfaces/Ipermission.repository";
import { v4 as uuidv4 } from "uuid";

export class PermissionRepository implements IPermissionRepository {
  // Share document permission
  async sharePermission(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<void> {
    await db
      .insert(permissions)
      .values({
        id: uuidv4(),
        documentId,
        userId,
        permissionType,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .execute();
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<any> {
    // Replace `any` with your DTO
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    return userResult[0] || null;
  }

  // Update existing permission
  async updatePermission(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<void> {
    await db
      .update(permissions)
      .set({ permissionType, updated_at: new Date() })
      .where(
        and(
          eq(permissions.documentId, documentId),
          eq(permissions.userId, userId)
        )
      )
      .execute();
  }
}
