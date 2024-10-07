// src/controllers/UserController.ts
import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { registerSchema, loginSchema } from "../validation/authvalidation";
import { AuthenticatedRequest } from "@middleware/authMiddleware";

export class UserController {
  private static userService: UserService;

  static setUserService(service: UserService) {
    this.userService = service;
  }

  static registerNewUser = async (req: Request, res: Response) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.errors,
      });
    }
    const { username, email, password } = req.body;
    try {
      await this.userService.registerNewUser(username, email, password);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to register user" });
    }
  };

  static registerNewAdmin = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.errors,
      });
    }
    const { username, email, password } = req.body;
    try {
      await this.userService.registerNewAdmin(username, email, password);
      res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to register admin" });
    }
  };

  static login = async (req: Request, res: Response) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.error.errors,
      });
    }
    const { username, password } = req.body;
    try {
      const token = await this.userService.login(username, password);
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(401).json({ message: "Invalid username or password" });
    }
  };

  static updateUser = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    try {
      const updatedUser = await this.userService.updateUser(
        id,
        username,
        email,
        password,
        role
      );
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  };

  static deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      await this.userService.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  };
}
