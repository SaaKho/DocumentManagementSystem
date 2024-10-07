import { Request, Response } from "express";
import {
  generateDownloadLink,
  serveFileByToken,
} from "../services/downloadService";

export class DownloadController {
  // Static method to generate a download link
  static async generateLink(req: Request, res: Response) {
    const { filename } = req.params;

    try {
      const downloadLink = generateDownloadLink(
        filename,
        req.protocol,
        req.get("host")!
      );
      res.status(200).json({ downloadLink });
    } catch (error: any) {
      console.error("Error generating download link:", error);
      res.status(500).json({ error: "Failed to generate download link" });
    }
  }

  // Static method to download a file using a token
  static async downloadFile(req: Request, res: Response) {
    const { token } = req.params;

    try {
      const downloadFilePath = serveFileByToken(token);
      res.download(downloadFilePath);
    } catch (error: any) {
      if (error.message === "File not found") {
        return res.status(404).json({ error: error.message });
      } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Download link has expired" });
      }
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  }
}
