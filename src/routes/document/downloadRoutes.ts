import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
// import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

// Generate a short-lived download link for a document file
router.post(
  "/generate-download-link/:filename",
  // authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { filename } = req.params;

    try {
      // Correct path to the 'uploads' directory inside 'src'
      let filePath = path.join(__dirname, "../../uploads", filename);
      if (!fs.existsSync(filePath)) {
        // Correct path to the 'documents' directory inside 'src'
        filePath = path.join(__dirname, "../../documents", filename);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: "File not found" });
        }
      }

      const token = jwt.sign({ filename }, JWT_SECRET, {
        expiresIn: LINK_EXPIRATION,
      });

      const downloadLink = `${req.protocol}://${req.get(
        "host"
      )}/api/documents/download/${token}`; // Ensure correct route

      res.status(200).json({ downloadLink });
    } catch (error: any) {
      console.error("Error generating download link:", error);
      res.status(500).json({ error: "Failed to generate download link" });
    }
  }
);

// Serve the file using the token
router.get(
  "/download/:token",
  // authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { filename: string };

      // Correct path to the 'uploads' directory inside 'src'
      let filePath = path.join(__dirname, "../../uploads", decoded.filename);
      if (!fs.existsSync(filePath)) {
        // Correct path to the 'documents' directory inside 'src'
        filePath = path.join(__dirname, "../../documents", decoded.filename);
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: "File not found" });
        }
      }

      // Ensure the 'downloads' directory inside 'src' exists
      const downloadsDir = path.join(__dirname, "../../downloads");
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      // Copy the file to the 'downloads' directory
      const downloadFilePath = path.join(downloadsDir, decoded.filename);
      fs.copyFileSync(filePath, downloadFilePath);

      // Serve the file from the 'downloads' directory
      res.download(downloadFilePath);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Download link has expired" });
      }
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  }
);

export default router;
