// src/cli/bulkDownload.ts

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:4000/api/download";
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret"; // Placeholder for authentication

async function getAuthToken(): Promise<string> {
  // Implement authentication if necessary
  return JWT_SECRET; // Replace with actual token retrieval
}

export async function bulkDownload(
  folderId: string,
  destination: string,
  batchSize = 5
) {
  // Dynamically import ora to handle ESM module requirement
  const ora = (await import("ora")).default;
  const spinner = ora("Fetching document list...").start();

  try {
    const token = await getAuthToken();
    const folderContents = await axios.get(
      `${API_BASE_URL}/folders/${folderId}/contents`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const documents = folderContents.data.documents;
    await fs.ensureDir(destination);
    spinner.succeed("Fetched document list.");

    // Download documents in batches
    spinner.start("Starting downloads...");
    const downloadPromises = documents.map((doc: any) =>
      downloadDocument(doc.id, destination, token)
    );

    for (let i = 0; i < downloadPromises.length; i += batchSize) {
      await Promise.all(downloadPromises.slice(i, i + batchSize));
    }

    spinner.succeed("All downloads completed successfully!");
  } catch (error: any) {
    spinner.fail(`Error fetching or downloading documents: ${error.message}`);
  }
}

async function downloadDocument(
  documentId: string,
  destination: string,
  token: string
) {
  try {
    const linkResponse = await axios.post(
      `${API_BASE_URL}/link`,
      { fileId: documentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const downloadLink = linkResponse.data.link;
    const fileResponse = await axios.get(downloadLink, {
      responseType: "stream",
    });
    const filePath = path.join(destination, `${documentId}.pdf`); // Adjust file extension as needed

    const writer = fs.createWriteStream(filePath);
    fileResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error: any) {
    console.error(
      `Failed to download document ID ${documentId}: ${error.message}`
    );
  }
}
