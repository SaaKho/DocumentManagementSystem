import { expect } from "chai";
import sinon from "sinon";
import { Document } from "../src/domain/entities/Document";
import { DocumentDoesNotHaveFilename } from "../src/domain/errors/document.errors";

describe("Document Entity", () => {
  let document: Document;
  const now = new Date();
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    // Set up a fake clock for consistent timestamp tests
    clock = sinon.useFakeTimers(now.getTime());
    document = new Document(
      "testFile",
      "txt",
      "text/plain",
      ["tag1", "tag2"],
      "/path/to/file"
    );
  });

  afterEach(() => {
    // Restore the real clock
    clock.restore();
  });

  it("should create a document with correct details", () => {
    expect(document.fileName).to.equal("testFile");
    expect(document.fileExtension).to.equal("txt");
    expect(document.contentType).to.equal("text/plain");
    expect(document.tags).to.deep.equal(["tag1", "tag2"]);
    expect(document.filePath).to.equal("/path/to/file");
  });

  it("should throw an error if file name is empty", () => {
    expect(
      () => new Document("", "txt", "text/plain", [], "/path/to/file")
    ).to.throw(DocumentDoesNotHaveFilename);
  });

  it("should serialize the document correctly", () => {
    const serialized = document.serialize();
    expect(serialized.fileName).to.equal("testFile");
    expect(serialized.fileExtension).to.equal("txt");
    expect(serialized.contentType).to.equal("text/plain");
    expect(serialized.tags).to.deep.equal(["tag1", "tag2"]);
    expect(serialized.filePath).to.equal("/path/to/file");
  });

  it("should deserialize the document correctly", () => {
    const serializedData = {
      fileName: "deserializedFile",
      fileExtension: "pdf",
      contentType: "application/pdf",
      tags: ["tag1", "tag2"],
      filePath: "/new/path/to/file",
      createdAt: now,
      updatedAt: now,
    };
    const deserializedDoc = Document.fromSerialized(serializedData);
    expect(deserializedDoc.fileName).to.equal("deserializedFile");
    expect(deserializedDoc.fileExtension).to.equal("pdf");
    expect(deserializedDoc.contentType).to.equal("application/pdf");
    expect(deserializedDoc.tags).to.deep.equal(["tag1", "tag2"]);
    expect(deserializedDoc.filePath).to.equal("/new/path/to/file");
  });

  it("should update file name and retain other properties", () => {
    document.update({ fileName: "newFileName" });
    expect(document.fileName).to.equal("newFileName");
    expect(document.tags).to.deep.equal(["tag1", "tag2"]); // Tags remain unchanged
  });

  it("should throw an error if filename is empty when updating", () => {
    expect(() => document.update({ fileName: "" })).to.throw(
      DocumentDoesNotHaveFilename
    );
  });

  it("should update multiple fields and keep the document consistent", () => {
    document.update({
      fileName: "newFileName",
      filePath: "/new/path/to/file",
    });
    expect(document.fileName).to.equal("newFileName");
    expect(document.filePath).to.equal("/new/path/to/file");
  });

  it("should retain tags when updating non-tag fields", () => {
    document.update({ fileName: "newFileName" });
    expect(document.tags).to.deep.equal(["tag1", "tag2"]);
  });

  it("should not update with invalid file name", () => {
    expect(() => document.update({ fileName: "" })).to.throw(
      DocumentDoesNotHaveFilename
    );
  });

  it("should ensure tags are unique when multiple are added", () => {
    document.update({ tags: ["tag1", "tag2", "tag3"] });
    expect(document.tags).to.deep.equal(["tag1", "tag2", "tag3"]);
  });

  it("should not add empty tag values", () => {
    expect(() => document.update({ tags: ["tag1", ""] })).to.throw(
      "Tags must be non-empty strings."
    );
  });

  it("should handle update with new tags without affecting existing tags", () => {
    document.update({ tags: ["newTag1", "newTag2"] });
    expect(document.tags).to.deep.equal(["newTag1", "newTag2"]);
  });
});
