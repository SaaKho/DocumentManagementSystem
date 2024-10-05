// src/repository/implementations/DownloadRepository.ts

import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { IDownloadRepository } from "../interfaces/Idownload.repository";
import { GenerateDownloadLinkDTO } from "../interfaces/download.dto";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

export class DownloadRepository implements IDownloadRepository {
  // Method for generating download link
  generateDownloadLink(dto: GenerateDownloadLinkDTO): string {
    const token = jwt.sign({ filename: dto.filename }, JWT_SECRET, {
      expiresIn: LINK_EXPIRATION,
    });

    return `${dto.protocol}://${dto.host}/api/download/${token}`;
  }

  // Method for serving file by token
  serveFileByToken(token: string): string {
    const decoded = jwt.verify(token, JWT_SECRET) as { filename: string };

    const downloadsDir = path.join(__dirname, "../../src/download");

    // Ensure the 'src/download' directory exists
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const downloadFilePath = path.join(downloadsDir, decoded.filename);

    // Create the file if it doesn't exist
    fs.writeFileSync(downloadFilePath, "This is the content of your document.");

    return downloadFilePath;
  }
}
