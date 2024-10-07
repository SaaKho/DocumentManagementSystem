// src/routes/authRoutes.ts
import express from "express";
import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";
import { UserController } from "../../controllers/userController";
import { UserService } from "../../services/userService";
import { UserRepository } from "../../repository/implementations/userRepository";
import { JwtAuthHandler } from "../../auth/handlers/JWTAuthHandler";
import { ConsoleLogger } from "../../logging/consoleLogger"; // Import Logger

const router = express.Router();

// Set up DI for UserService
const userRepository = new UserRepository();
const authHandler = new JwtAuthHandler(userRepository);
const logger = new ConsoleLogger(); 
const userService = new UserService(userRepository, authHandler, logger); 
UserController.setUserService(userService);

// Routes
router.post("/register", UserController.registerNewUser);
router.post(
  "/registerAdmin",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.registerNewAdmin
);
router.post("/login", UserController.login);
router.put(
  "/updateUser/:id",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.updateUser
);
router.delete(
  "/deleteUser/:id",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.deleteUser
);

export default router;
