import { expect } from "chai";
import { Document } from "../../../domain/entities/Document";

describe("Document Entity", () => {
  it("should create a document with valid properties", () => {
    const document = new Document("doc1", "sampleFile", "txt", "text/plain", [
      "tag1",
      "tag2",
    ]);

    expect(document.getId()).to.equal("doc1");
    expect(document.getFileName()).to.equal("sampleFile");
    expect(document.getFileExtension()).to.equal("txt");
    expect(document.getContentType()).to.equal("text/plain");
    expect(document.getTags()).to.deep.equal(["tag1", "tag2"]);
  });

  it("should throw an error if file name is empty", () => {
    expect(() => new Document("doc2", "", "txt", "text/plain")).to.throw(
      "File name cannot be empty."
    );
  });

  it("should update the file name and timestamp", () => {
    const document = new Document("doc3", "oldName", "pdf", "application/pdf");
    document.updateFileName("newName");
    expect(document.getFileName()).to.equal("newName");
    expect(document.getUpdatedAt()).to.be.instanceOf(Date);
  });
});
