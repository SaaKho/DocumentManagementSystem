import express, { Request, Response } from "express";
import { db, documents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Add a new tag to a document
router.post("/:documentId/tag", async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { key, name } = req.body;

  if (!key || !name) {
    return res
      .status(400)
      .json({ error: "Both 'key' and 'name' are required." });
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
    const newTag = `${key}:${name}`;

    if (existingTags.includes(newTag)) {
      return res
        .status(409)
        .json({ error: "Tag with the same key and name already exists." });
    }

    existingTags.push(newTag);

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
router.put("/:documentId/tag", async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { oldKey, oldName, newKey, newName } = req.body;

  if (!oldKey || !oldName || !newKey || !newName) {
    return res.status(400).json({
      error:
        "All fields ('oldKey', 'oldName', 'newKey', 'newName') are required.",
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
    const oldTag = `${oldKey}:${oldName}`;
    const newTag = `${newKey}:${newName}`;

    const tagIndex = existingTags.indexOf(oldTag);

    if (tagIndex === -1) {
      return res.status(404).json({ error: "Tag not found." });
    }

    existingTags[tagIndex] = newTag;

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
router.delete(
  "/:documentId/tag",
  async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { key, name } = req.body;

    if (!key || !name) {
      return res
        .status(400)
        .json({ error: "Both 'key' and 'name' are required." });
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
      const tagToDelete = `${key}:${name}`;

      const tagIndex = existingTags.indexOf(tagToDelete);

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
  }
);

export default router;
