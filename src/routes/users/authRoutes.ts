import express from "express";
import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";
import { UserController } from "../../controllers/userController";

const router = express.Router();
const userController = new UserController();

// Public route for user registration
router.post("/register", userController.registerNewUser.bind(userController));

router.post(
  "/registerAdmin",
  authMiddleware,
  authorizeRole("Admin"),
  userController.registerNewAdmin.bind(userController)
);

router.post("/login", userController.login.bind(userController));

router.put(
  "/update/:id",
  // authMiddleware,
  // authorizeRole("Admin"),
  userController.updateUser.bind(userController)
);

router.delete(
  "/deleteUser/:id",
  // authMiddleware,
  // authorizeRole("Admin"),
  userController.deleteUser.bind(userController)
);

export default router;
