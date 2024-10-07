import { Request, Response } from "express";
import { DownloadService } from "../services/downloadService";

export class DownloadController {
  private static downloadService: DownloadService;

  static setDownloadService(service: DownloadService) {
    DownloadController.downloadService = service;
  }

  // Generate download link without using DTO
  static generateLink = async (req: Request, res: Response) => {
    const { filename } = req.params;

    try {
      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      // Generate download link by passing parameters
      const downloadLink =
        await DownloadController.downloadService.generateDownloadLink(
          req.protocol,
          req.get("host")!,
          filename
        );

      res.status(200).json({ downloadLink });
    } catch (error: any) {
      console.error("Error generating download link:", error.message);
      res.status(500).json({ error: "Failed to generate download link" });
    }
  };

  // Serve the file based on token
  static downloadFile = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const downloadFilePath =
        await DownloadController.downloadService.serveFileByToken(token);
      res.download(downloadFilePath);
    } catch (error: any) {
      console.error("Error serving file:", error.message);

      if (error.message === "File not found") {
        return res.status(404).json({ error: error.message });
      } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Download link has expired" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(400).json({ error: "Invalid download token" });
      }

      res.status(500).json({ error: "Failed to download file" });
    }
  };
}
