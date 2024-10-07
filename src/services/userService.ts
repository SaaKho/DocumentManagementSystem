// src/services/UserService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../repository/interfaces/IUser.Repository";
import { IAuthHandler } from "../auth/interfaces/IAuthHandler";
import { User } from "../entities/User";
import { Logger } from "../logging/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export class UserService {
  private userRepository: IUserRepository;
  private authHandler: IAuthHandler;
  private logger: Logger;

  constructor(
    userRepository: IUserRepository,
    authHandler: IAuthHandler,
    logger: Logger
  ) {
    this.userRepository = userRepository;
    this.authHandler = authHandler;
    this.logger = logger;
  }

  async registerNewUser(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    this.logger.log(`Registering new user: ${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User("", username, email, hashedPassword, "User");
    try {
      const createdUser = await this.userRepository.createUser(newUser);
      this.logger.log(`User ${username} registered successfully`);
      return createdUser;
    } catch (error: any) {
      this.logger.error(`Failed to register user: ${error.message}`);
      throw error;
    }
  }

  async registerNewAdmin(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    this.logger.log(`Registering new admin: ${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User("", username, email, hashedPassword, "Admin");
    try {
      const createdAdmin = await this.userRepository.createUser(newAdmin);
      this.logger.log(`Admin ${username} registered successfully`);
      return createdAdmin;
    } catch (error: any) {
      this.logger.error(`Failed to register admin: ${error.message}`);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<string> {
    const user: User | null = await this.userRepository.findUserByUsername(
      username.toLowerCase()
    );

    if (!user) {
      this.logger.error(`User not found: ${username}`);
      throw new Error("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.getPassword());
    if (!isPasswordValid) {
      this.logger.error(`Password mismatch for user: ${username}`);
      throw new Error("Invalid username or password");
    }

    const token = jwt.sign(
      { id: user.getId(), username: user.getUsername(), role: user.getRole() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    this.logger.log(`User logged in successfully: ${username}`);
    return token;
  }

  async updateUser(
    id: string,
    username?: string,
    email?: string,
    password?: string,
    role?: string
  ): Promise<User | null> {
    this.logger.log(`Updating user with ID: ${id}`);
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;
    const user = new User(
      id,
      username || "",
      email || "",
      hashedPassword || "",
      role || "User"
    );
    try {
      const updatedUser = await this.userRepository.updateUser(user);
      this.logger.log(`User with ID ${id} updated successfully`);
      return updatedUser;
    } catch (error: any) {
      this.logger.error(
        `Failed to update user with ID ${id}: ${error.message}`
      );
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deleting user with ID: ${id}`);
    try {
      const userDeleted = await this.userRepository.deleteUser(id);
      if (!userDeleted) {
        this.logger.error(
          `Failed to delete user with ID ${id}: User not found`
        );
        throw new Error("User not found");
      }
      this.logger.log(`User with ID ${id} deleted successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to delete user with ID ${id}: ${error.message}`
      );
      throw error;
    }
  }
}
