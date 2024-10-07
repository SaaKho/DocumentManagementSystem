import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { IDownloadRepository } from "../interfaces/Idownload.repository";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

export class DownloadRepository implements IDownloadRepository {
  // Method for generating download link
  generateDownloadLink(
    protocol: string,
    host: string,
    filename: string
  ): string {
    const token = jwt.sign({ filename }, JWT_SECRET, {
      expiresIn: LINK_EXPIRATION,
    });

    return `${protocol}://${host}/api/download/${token}`;
  }

  // Method for serving file by token
  serveFileByToken(token: string): string {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { filename: string };
      const downloadsDir = path.join(__dirname, "../../src/download");

      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const downloadFilePath = path.join(downloadsDir, decoded.filename);

      if (!fs.existsSync(downloadFilePath)) {
        fs.writeFileSync(
          downloadFilePath,
          "This is the content of your document."
        );
      }

      return downloadFilePath;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new Error("TokenExpiredError: The download link has expired.");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("InvalidTokenError: Invalid token provided.");
      }
      throw new Error("Failed to verify the download token.");
    }
  }
}
