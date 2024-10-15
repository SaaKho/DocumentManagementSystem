import { expect } from "chai";
import sinon from "sinon";
import { DocumentService } from "../../../application/services/documentService";
import { DocumentRepository } from "../../../infrastructure/repository/documentRepository";
import { ConsoleLogger } from "../../../infrastructure/logging/consoleLogger";

describe("Document Service", () => {
  let documentService: DocumentService;
  let documentRepository: sinon.SinonStubbedInstance<DocumentRepository>;
  let logger: sinon.SinonStubbedInstance<ConsoleLogger>;

  beforeEach(() => {
    documentRepository = sinon.createStubInstance(DocumentRepository);
    logger = sinon.createStubInstance(ConsoleLogger);
    documentService = new DocumentService();

    documentService.documentRepository = documentRepository as any;
    documentService.logger = logger as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a document successfully", async () => {
    const mockDocument = { getId: () => "doc1" };
    documentRepository.createDocument.resolves(mockDocument as any);
    documentRepository.assignOwnerPermission.resolves();

    const result = await documentService.createDocument(
      "user1",
      "sampleFile",
      "txt",
      "text/plain",
      ["tag1", "tag2"]
    );

    expect(result).to.equal(mockDocument);
    expect(documentRepository.createDocument.calledOnce).to.be.true;
    expect(logger.log.calledWith("Creating new document: sampleFile.txt")).to.be
      .true;
  });

  it("should return an error if document creation fails", async () => {
    documentRepository.createDocument.rejects(new Error("Create failed"));

    try {
      await documentService.createDocument(
        "user2",
        "sampleFile",
        "txt",
        "text/plain"
      );
    } catch (error) {
      expect((error as Error).message).to.equal("Error creating document");
      expect(logger.error.calledWith("Error creating document: Create failed"))
        .to.be.true;
    }
  });
});
