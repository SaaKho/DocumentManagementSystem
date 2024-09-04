// src/services/documentService.ts
import { DocumentRepository } from "../repository/documentRepository";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const documentRepository = new DocumentRepository();

export const getDocumentByIdService = async (id: string) => {
  const document = await documentRepository.getDocumentById(id);
  if (!document) throw new Error("Document not found");
  return document;
};

export const getAllDocumentsService = async () => {
  return await documentRepository.getAllDocuments();
};

export const createNewDocumentService = async (
  fileName: string,
  fileExtension: string,
  contentType: string,
  tags: string | string[]
) => {
  // Ensure the file path is relative to src/documents
  const documentsDir = path.join(__dirname, "../documents");

  // Ensure the directory exists
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }

  // Define the full path of the file
  // const fullFilePath = path.join(documentsDir, `${fileName}${fileExtension}`);
  const fullFilePath = path.join(documentsDir, `${uuidv4()}${fileExtension}`);


  // Create the file with some placeholder content if it doesn't exist
  if (!fs.existsSync(fullFilePath)) {
    fs.writeFileSync(
      fullFilePath,
      "Placeholder content for the document",
      "utf8"
    );
  }

  const tagsArray = Array.isArray(tags) ? tags : tags.split(",");

  const newDocumentData = {
    id: uuidv4(),
    fileName,
    fileExtension,
    contentType,
    tags: tagsArray,
  };

  // Save the document data to the database
  const newDocument = await documentRepository.createDocument(newDocumentData);

  return { newDocument, fullFilePath };
};

export const uploadDocumentService = async (
  file: Express.Multer.File,
  tags: string[]
) => {
  const metadata = {
    fileName: path.parse(file.originalname).name,
    fileExtension: path.extname(file.originalname),
    contentType: file.mimetype,
    tags,
  };

  const newDocument = await documentRepository.createDocument(metadata);

  const filePath = path.join(__dirname, "../../uploads", file.filename);

  return { newDocument, filePath };
};

// export const uploadDocumentService = async (
//   file: Express.Multer.File,
//   tags: string[]
// ) => {
//   const id = uuidv4(); // Generate the UUID once

//   const metadata = {
//     id, // Use this UUID as the document ID in the database
//     fileName: path.parse(file.originalname).name,
//     fileExtension: path.extname(file.originalname),
//     contentType: file.mimetype,
//     tags,
//   };

//   const newDocument = await documentRepository.createDocument(metadata);

//   // Use the same UUID for the file name
//   const filePath = path.join(__dirname, "../../uploads", `document_${id}${metadata.fileExtension}`);

//   // Move file to the correct location (if not already handled by multer)
//   fs.renameSync(file.path, filePath);

//   return { newDocument, filePath };
// };

export const deleteDocumentService = async (id: string) => {
  const existingDocument = await documentRepository.getDocumentById(id);
  if (!existingDocument) {
    throw new Error("Document not found");
  }

  await documentRepository.deleteDocument(id);

  const filePath = path.join(
    __dirname,
    "../../uploads",
    `${existingDocument.fileName}${existingDocument.fileExtension}`
  );
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return existingDocument;
};
