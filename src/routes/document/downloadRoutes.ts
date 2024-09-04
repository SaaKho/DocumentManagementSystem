import express from "express";
import { DownloadController } from "../../controllers/downloadController";

const router = express.Router();

const downloadController = new DownloadController();

router.post(
  "/generate-download-link/:filename",
  downloadController.generateLink.bind(downloadController)
);
router.get("/:token", downloadController.donwloadFile.bind(downloadController));

export default router;
