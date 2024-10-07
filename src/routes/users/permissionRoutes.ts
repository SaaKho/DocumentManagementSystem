import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { sharePermissionMiddleware } from "../../middleware/sharePermissionMiddleware";
import { PermissionsController } from "../../controllers/permissionController";
import { PermissionsService } from "../../services/permissionService";
import { PermissionRepository } from "../../repository/implementations/permissionRepository";
import { ConsoleLogger } from "../../logging/consoleLogger"; // Import the logger

// Initialize repository, logger, and service
const permissionRepository = new PermissionRepository();
const logger = new ConsoleLogger(); // Create logger instance
const permissionService = new PermissionsService(permissionRepository, logger); 

PermissionsController.setPermissionsService(permissionService);

const router = Router();

// Route to share document permissions
router.post(
  "/share/:documentId",
  authMiddleware,
  sharePermissionMiddleware, 
  PermissionsController.shareDocument // Share document logic in controller
);

export default router;
