import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { registerSchema, loginSchema } from "../validation/authvalidation";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

// Route for user registration (open to all users)
router.post("/register", async (req: Request, res: Response) => {
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
        role: "user", // Default role is 'user'
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
router.post("/login", async (req: Request, res: Response) => {
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
      { id: user.id, username: user.username, role: user.role }, // Include role in token
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

// Route to update a user (accessible only to Admin)
router.put(
  "/update/:id",
  authMiddleware,
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    try {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;
      const updatedUser = await db
        .update(users)
        .set({
          username: username || undefined,
          email: email || undefined,
          password: hashedPassword || undefined,
          role: role || undefined,
        })
        .where(eq(users.id, id))
        .returning()
        .execute();

      if (updatedUser.length > 0) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

// Route to delete a user (accessible only to Admin)
router.delete(
  "/deleteUser/:id",
  authMiddleware,
  authorizeRole("Admin"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const deleteResult = await db
        .delete(users)
        .where(eq(users.id, id))
        .execute();

      if (deleteResult.rowCount && deleteResult.rowCount > 0) {
        res.status(204).send(); // Success: No Content
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

export default router;
