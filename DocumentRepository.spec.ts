import { expect } from "chai";
import sinon from "sinon";
import { DocumentRepository } from "../../../infrastructure/repository/documentRepository";
import { db } from "../../../infrastructure/drizzle/schema";

describe("Document Repository", () => {
  let documentRepository: DocumentRepository;

  beforeEach(() => {
    documentRepository = new DocumentRepository();
  });

  it("should find a document by ID", async () => {
    const mockDocument = { id: "doc1", fileName: "sample" };
    sinon.stub(db, "select").returns([mockDocument] as any);

    const result = await documentRepository.findDocumentById("doc1");
    expect(result?.getId()).to.equal("doc1");
  });

  afterEach(() => {
    sinon.restore();
  });
});
