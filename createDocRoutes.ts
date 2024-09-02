import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ExcelJS from "exceljs";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";
import fs from "fs";
import { db, documents } from "../drizzle/schema";
import path from "path";
import multer from "multer";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

// Apply the auth middleware to all routes
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const filename = `document_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Endpoint to upload a document with metadata
router.post(
  "/uploadDocument",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { title, author, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const metadata = {
        title,
        content: "User-uploaded document",
        author,
        tags: tags ? tags.split(",") : [],
        metadata: JSON.stringify({
          filename: file.filename,
          uploadedAt: new Date().toISOString(),
        }),
      };

      const newDocument = await db
        .insert(documents)
        .values(metadata)
        .returning();

      res
        .status(201)
        .json({
          message: "Document uploaded successfully",
          document: newDocument,
        });
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

//Route to create a Excel Document
router.post("/createExcelDocument", async (req: Request, res: Response) => {
  try {
    // Step 1: Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sample Data");

    // Step 2: Add some sample data to the worksheet
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
    ];

    worksheet.addRow({
      id: 1,
      name: "Saadan Khokhar",
      email: "saadan.khokhar@example.com",
    });
    worksheet.addRow({
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@example.com",
    });

    // Step 3: Generate a unique filename
    const filename = `document_${uuidv4()}.xlsx`;

    // Step 4: Define the path to save the file inside the 'src/documents' directory
    const documentsDir = path.join(__dirname, "../documents");

    // Ensure the 'documents' directory exists
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    // Define the full file path
    const filePath = path.join(documentsDir, filename);

    // Step 5: Write the Excel file to the specified path
    await workbook.xlsx.writeFile(filePath);

    // Step 6: Automatically generate metadata
    const metadata = {
      title: "Sample Excel Document",
      content: "This is a sample Excel document generated by the API.",
      author: "System",
      tags: ["sample", "excel", "document"],
      metadata: JSON.stringify({
        filename,
        generatedAt: new Date().toISOString(),
      }),
    };

    // Step 7: Store metadata in the database
    const newDocument = await db.insert(documents).values(metadata).returning();

    // Step 8: Respond with the document metadata
    res.status(201).json({
      message: "Excel document created successfully",
      document: newDocument,
    });
  } catch (error: any) {
    console.error("Error creating Excel document:", error);
    res.status(500).json({ error: "Failed to create Excel document" });
  }
});

// Endpoint to create a Word document and store metadata
router.post("/createWordDocument", async (req: Request, res: Response) => {
  try {
    // Step 1: Create a new Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun(
                  "This is a sample Word document generated by the API."
                ),
                new TextRun({
                  text: "\nGenerated using docx package.",
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Step 2: Generate a unique filename
    const filename = `document_${uuidv4()}.docx`;

    // Step 3: Define the path to save the file inside the 'src/documents' directory
    const documentsDir = path.join(__dirname, "../documents");

    // Ensure the 'documents' directory exists
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    // Define the full file path
    const filePath = path.join(documentsDir, filename);

    // Step 4: Write the Word document to the specified path
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    // Step 5: Automatically generate metadata
    const metadata = {
      title: "Sample Word Document",
      content: "This is a sample Word document generated by the API.",
      author: "System",
      tags: ["sample", "word", "document"],
      metadata: JSON.stringify({
        filename,
        generatedAt: new Date().toISOString(),
      }),
    };

    // Step 6: Store metadata in the database
    const newDocument = await db.insert(documents).values(metadata).returning();

    // Step 7: Respond with the document metadata
    res.status(201).json({
      message: "Word document created successfully",
      document: newDocument,
    });
  } catch (error: any) {
    console.error("Error creating Word document:", error);
    res.status(500).json({ error: "Failed to create Word document" });
  }
});

router.post("/createPdfDocument", async (req: Request, res: Response) => {
  try {
    // Step 1: Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    // Set up font and text
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const textSize = 30;
    const text = "This is a sample PDF document generated by the API.";

    // Add text to the page
    page.drawText(text, {
      x: 50,
      y: 300,
      size: textSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    // Step 2: Generate a unique filename
    const filename = `document_${uuidv4()}.pdf`;

    // Step 3: Define the path to save the file inside the 'src/documents' directory
    const documentsDir = path.join(__dirname, "../documents");

    // Ensure the 'documents' directory exists
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    // Define the full file path
    const filePath = path.join(documentsDir, filename);

    // Step 4: Save the PDF file to the specified path
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    // Step 5: Automatically generate metadata
    const metadata = {
      title: "Sample PDF Document",
      content: "This is a sample PDF document generated by the API.",
      author: "System",
      tags: ["sample", "pdf", "document"],
      metadata: JSON.stringify({
        filename,
        generatedAt: new Date().toISOString(),
      }),
    };

    // Step 6: Store metadata in the database
    const newDocument = await db.insert(documents).values(metadata).returning();

    // Step 7: Respond with the document metadata
    res.status(201).json({
      message: "PDF document created successfully",
      document: newDocument,
    });
  } catch (error: any) {
    console.error("Error creating PDF document:", error);
    res.status(500).json({ error: "Failed to create PDF document" });
  }
});

export default router;