import express from "express";
import { DownloadController } from "../../controllers/downloadController";
import { DownloadService } from "../../services/downloadService";
import { DownloadRepository } from "../../repository/implementations/downloadRepository";
import { ConsoleLogger } from "../../logging/consoleLogger"; // Import the logger

const router = express.Router();

// Initialize repository, logger, and service, then inject into controller
const downloadRepository = new DownloadRepository();
const logger = new ConsoleLogger(); // Create an instance of the logger
const downloadService = new DownloadService(downloadRepository, logger); // Inject logger into the service

DownloadController.setDownloadService(downloadService);

router.post(
  "/generate-download-link/:filename",
  DownloadController.generateLink
);

router.get("/:token", DownloadController.downloadFile);

export default router;
