import { expect } from "chai";
import { DocumentFactory } from "../../../domain/factories/documentFactory";
import { Document } from "../../../domain/entities/Document";

describe("Document Factory", () => {
  it("should create a new document instance", () => {
    const document = DocumentFactory.createDocument(
      "doc1",
      "testFile",
      "pdf",
      "application/pdf",
      ["tag1"]
    );

    expect(document).to.be.instanceOf(Document);
    expect(document.getFileName()).to.equal("testFile");
    expect(document.getFileExtension()).to.equal("pdf");
    expect(document.getContentType()).to.equal("application/pdf");
  });
});
