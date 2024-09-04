import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

export const generateDownloadLink = (
  filename: string,
  protocol: string,
  host: string
) => {
  const token = jwt.sign({ filename }, JWT_SECRET, {
    expiresIn: LINK_EXPIRATION,
  });

  const downloadLink = `${protocol}://${host}/api/documents/download/${token}`;
  return downloadLink;
};

export const serveFileByToken = (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET) as { filename: string };

  const uploadsDir = path.join(__dirname, "../../uploads", decoded.filename);
  const documentsDir = path.join(
    __dirname,
    "../../documents",
    decoded.filename
  );

  console.log("Decoded filename:", decoded.filename);
  console.log("Checking file in uploadsDir:", uploadsDir);
  console.log("Checking file in documentsDir:", documentsDir);

  let filePath = uploadsDir;
  if (!fs.existsSync(filePath)) {
    filePath = documentsDir;
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }
  }

  const downloadsDir = path.join(__dirname, "../../downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const downloadFilePath = path.join(downloadsDir, decoded.filename);
  fs.copyFileSync(filePath, downloadFilePath);

  console.log("File copied to downloads directory:", downloadFilePath);

  return downloadFilePath;
};
