import express, { Request, Response } from "express";
import { db, documents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Add a new tag to a document
router.post("/addNewTag/:documentId", async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "'name' is required." });
  }

  try {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (document.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    const existingTags = document[0].tags || [];

    if (existingTags.includes(name)) {
      return res
        .status(409)
        .json({ error: "Tag with the same name already exists." });
    }

    existingTags.push(name);

    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning();

    res.status(200).json({
      message: "Tag added successfully",
      document: updatedDocument[0],
    });
  } catch (error: any) {
    console.error("Error adding tag:", error);
    res.status(500).json({ error: "Failed to add tag" });
  }
});

// Update an existing tag in a document
router.put("/updateTag/:documentId", async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { oldName, newName } = req.body;

  if (!oldName || !newName) {
    return res.status(400).json({
      error: "'oldName' and 'newName' are required.",
    });
  }

  try {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (document.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    const existingTags = document[0].tags || [];
    const tagIndex = existingTags.indexOf(oldName);

    if (tagIndex === -1) {
      return res.status(404).json({ error: "Tag not found." });
    }

    existingTags[tagIndex] = newName;

    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning();

    res.status(200).json({
      message: "Tag updated successfully",
      document: updatedDocument[0],
    });
  } catch (error: any) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
});

// Delete a tag from a document
router.delete("/deleteTag/:documentId", async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { name } = req.body; // Now only 'name' is required

  if (!name) {
    return res.status(400).json({ error: "'name' is required." });
  }

  try {
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .execute();

    if (document.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    const existingTags = document[0].tags || [];
    const tagIndex = existingTags.indexOf(name);

    if (tagIndex === -1) {
      return res.status(404).json({ error: "Tag not found." });
    }

    existingTags.splice(tagIndex, 1);

    const updatedDocument = await db
      .update(documents)
      .set({ tags: existingTags })
      .where(eq(documents.id, documentId))
      .returning();

    res.status(200).json({
      message: "Tag deleted successfully",
      document: updatedDocument[0],
    });
  } catch (error: any) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

export default router;
