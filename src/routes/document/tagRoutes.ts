import express from "express";
import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";
import { TagController } from "../../controllers/tagController";

const router = express.Router();
const tagController = new TagController();

router.post(
  "/addNewTag/:documentId",
  tagController.addNewTag.bind(tagController)
);

router.put(
  "/updateTag/:documentId",
  tagController.updateTag.bind(tagController)
);

router.delete(
  "/deleteTag/:documentId",
  tagController.deleteTag.bind(tagController)
);

export default router;
