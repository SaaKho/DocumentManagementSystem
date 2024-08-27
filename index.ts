import express, { Request, Response } from "express";
import { db, documents, users } from "./drizzle/schema";
import { authMiddleware } from "./middleware/authmiddleware";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Set up environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Define Zod Schemas

// User Registration Schema
const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// User Login Schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Document Schema
const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
});

// Route for user registration
app.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  const { username, email, password } = parsed.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Route for user login
app.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  const { username, password } = parsed.data;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .execute();
    const user = result[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to log in" });
  }
});

// Create a new document with metadata (protected by JWT)
app.post(
  "/addDocument",
  authMiddleware,
  async (req: Request, res: Response) => {
    const parsed = documentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const { title, content, author } = parsed.data;

    try {
      const newDocument = await db
        .insert(documents)
        .values({
          title,
          content,
          author,
        })
        .returning();

      res.status(201).json(newDocument);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create document" });
    }
  }
);

// Get all documents (protected by JWT)
app.get(
  "/alldocuments",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const allDocuments = await db.select().from(documents).execute();
      res.status(200).json(allDocuments);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  }
);

// Get a single document by ID (protected by JWT)
app.get(
  "/documents/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const result = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .execute();
      const document = result[0];
      if (document) {
        res.status(200).json(document);
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  }
);

// Update a document by ID (protected by JWT)
app.put(
  "/documents/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const parsed = documentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const { id } = req.params;
    const { title, content, author } = parsed.data;

    try {
      const updatedDocument = await db
        .update(documents)
        .set({ title, content, author })
        .where(eq(documents.id, id))
        .returning()
        .execute();

      res.status(200).json(updatedDocument);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update document" });
    }
  }
);

// Delete a document by ID (protected by JWT)
app.delete(
  "/documents/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await db.delete(documents).where(eq(documents.id, id)).execute();
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  }
);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload a document file (protected by JWT)
app.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  (req: Request, res: Response) => {
    res
      .status(200)
      .send({ message: "File uploaded successfully", file: req.file });
  }
);

// Generate a short-lived download link for a file (protected by JWT)
app.get(
  "/download/:filename",
  authMiddleware,
  (req: Request, res: Response) => {
    const { filename } = req.params;
    const file = `${__dirname}/uploads/${filename}`;

    jwt.sign({ file }, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err)
        return res.status(500).send({ message: "Error generating token" });
      res.send({ token });
    });
  }
);

// Endpoint to download a file with a valid token
app.get("/file/:token", (req: Request, res: Response) => {
  const { token } = req.params;
  jwt.verify(
    token,
    JWT_SECRET,
    (err: any, decoded: jwt.JwtPayload | string | undefined) => {
      if (
        err ||
        !decoded ||
        typeof decoded !== "object" ||
        !("file" in decoded)
      ) {
        return res.status(500).send({ message: "Invalid or expired token" });
      }

      const filePath = (decoded as jwt.JwtPayload).file;

      res.download(filePath, (downloadErr) => {
        if (downloadErr) {
          return res.status(500).send({ message: "Failed to download file" });
        }
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
