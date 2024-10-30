// src/repository/implementations/UserRepository.ts
import { db, users } from "../../infrastructure/drizzle/schema";
import { IUserRepository } from "../../domain/interfaces/IUser.Repository";
import { User } from "../../domain/entities/User";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { injectable } from "inversify";
import { RepositoryResult } from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import {
  UserNotFoundError,
  UserAlreadyExistsError,
} from "../../domain/errors/user.error";

@injectable()
export class UserRepository implements IUserRepository {
  async fetchByName(
    username: string
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const userRecord = await db
        .select()
        .from(users)
        .where(sql`LOWER(${users.username}) = LOWER(${username})`)
        .execute();

      if (!userRecord[0]) {
        return Result.Err(new UserNotFoundError(username));
      }

      const foundUser = userRecord[0];
      const entity = User.fromSerialized({
        ...foundUser,
        createdAt: foundUser.createdAt || new Date(),
        updatedAt: foundUser.updatedAt || new Date(),
      });

      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new UserNotFoundError(username));
    }
  }

  // Find a user by ID
  async fetchById(
    userId: string
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .execute();

      if (!userRecord[0]) {
        return Result.Err(new UserNotFoundError(userId));
      }
      const foundUser = userRecord[0];
      const entity = User.fromSerialized({
        ...foundUser,
        createdAt: foundUser.createdAt || new Date(),
        updatedAt: foundUser.updatedAt || new Date(),
      });
      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new UserNotFoundError(userId));
    }
  }

  // Create a new user
  async insert(
    user: User
  ): Promise<RepositoryResult<User, UserAlreadyExistsError>> {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password
    const id = uuidv4(); // Generate a unique ID
    try {
      const serialized = user.serialize();
      const result = await db.insert(users).values(serialized).execute();

      if (result.rowCount === 0) {
        return Result.Err(new UserAlreadyExistsError(user.username));
      }
      const entity = User.fromSerialized({
        ...serialized,
        id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new UserAlreadyExistsError(user.username));
    }
  }

  // Update an existing user
  async update(
    entity: User
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const serialized = entity.serialize();
      const updatedUser = await db
        .update(users)
        .set(serialized)
        .where(eq(users.id, entity.id))
        .returning()
        .execute();

      if (!updatedUser[0]) {
        return Result.Err(new UserNotFoundError(serialized.id));
      }

      const userEntity = User.fromSerialized({
        ...updatedUser[0],
        createdAt: updatedUser[0].createdAt || new Date(),
        updatedAt: updatedUser[0].updatedAt || new Date(),
      });
      return Result.Ok(userEntity);
    } catch (error: any) {
      return Result.Err(new UserNotFoundError(entity.id));
    }
  }

  // // Delete a user by ID
  async delete(
    userId: string
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const userRecord = await this.fetchById(userId);
      if (userRecord.isErr()) {
        return Result.Err(new UserNotFoundError(userId));
      }
      await db.delete(users).where(eq(users.id, userId)).execute();
      return userRecord;
    } catch (error: any) {
      return Result.Err(new UserNotFoundError(userId));
    }
  }
}
