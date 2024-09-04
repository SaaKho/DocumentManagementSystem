import { Request, Response } from "express";
import {
  registerNewUserService,
  registerNewAdminService,
  loginService,
  updateUserService,
  deleteUserService,
} from "../services/userService";
import { AuthenticatedRequest } from "../../src/middleware/authMiddleware";

export class UserController {
  // Method to register a new user
  async registerNewUser(req: Request, res: Response) {
    const { username, email, password } = req.body;
    try {
      const newUser = await registerNewUserService(username, email, password);
      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to register user" });
    }
  }

  // Method to register a new admin
  async registerNewAdmin(req: AuthenticatedRequest, res: Response) {
    const { username, email, password } = req.body;

    try {
      const newAdmin = await registerNewAdminService(username, email, password);
      res
        .status(201)
        .json({ message: "Admin registered successfully", user: newAdmin });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to register admin" });
    }
  }

  // Method to login
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    try {
      const token = await loginService(username, password);
      res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
      if (error.message === "Invalid username or password") {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to Login" });
    }
  }

  // Method to update a user
  async updateUser(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    try {
      const updatedUser = await updateUserService(
        id,
        username,
        email,
        password,
        role
      );
      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update user" });
    }
  }

  // Method to delete a user
  async deleteUser(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const deletedUser = await deleteUserService(id);
      res
        .status(200)
        .json({ message: "User deleted successfully"});
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}
