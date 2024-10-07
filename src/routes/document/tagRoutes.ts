import express from "express";
import { TagController } from "../../controllers/tagController";
import { TagService } from "../../services/tagService";
import { TagRepository } from "../../repository/implementations/tagRepository";
import { ConsoleLogger } from "../../logging/consoleLogger"; // Import logger

// Initialize repository, logger, and service
const tagRepository = new TagRepository();
const logger = new ConsoleLogger(); // Create logger instance
const tagService = new TagService(tagRepository, logger); // Inject logger into service

TagController.setTagService(tagService);

const router = express.Router();

router.post("/addNewTag/:documentId", TagController.addNewTag);
router.put("/updateTag/:documentId", TagController.updateTag);
router.delete("/deleteTag/:documentId", TagController.deleteTag);

export default router;
