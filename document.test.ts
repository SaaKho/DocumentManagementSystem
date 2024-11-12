import { expect } from "chai";
import sinon from "sinon";
import { Document } from "../src/domain/entities/Document";
import { DocumentDoesNotHaveFilename } from "../src/domain/errors/document.errors";
import { TagVO } from "../src/domain/valueObjects/Tag";
import { ContentType } from "../src/domain/refined/document.refined";

describe("Document Entity", () => {
  let document: Document;
  const now = new Date();
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime());

    console.log("Creating a new Document instance for testing...");
    document = new Document(
      "testFile",
      "txt",
      ContentType.from("pdf"), // Use valid ContentType
      [
        TagVO.create({ tag: "tag1" }).unwrap(),
        TagVO.create({ tag: "tag2" }).unwrap(),
      ],
      "/path/to/file"
    );
  });

  afterEach(() => {
    clock.restore();
  });

  it("should create a document with correct details", () => {
    console.log("Testing document creation...");
    expect(document.fileName).to.equal("testFile");
    expect(document.fileExtension).to.equal("txt");
    expect(document.contentType.valueOf()).to.equal("pdf");
    expect(document.getTags()).to.deep.equal(["tag1", "tag2"]);
    expect(document.filePath).to.equal("/path/to/file");
  });

  it("should throw an error if file name is empty", () => {
    console.log("Testing error handling for empty filename...");
    expect(
      () =>
        new Document("", "txt", ContentType.from("doc"), [], "/path/to/file")
    ).to.throw(DocumentDoesNotHaveFilename);
  });

  it("should serialize the document correctly", () => {
    console.log("Testing document serialization...");
    const serialized = document.serialize();
    console.log("Serialized Document:", serialized);
    expect(serialized.fileName).to.equal("testFile");
    expect(serialized.fileExtension).to.equal("txt");
    expect(serialized.contentType).to.equal("pdf");
    expect(serialized.tags).to.deep.equal(["tag1", "tag2"]);
    expect(serialized.filePath).to.equal("/path/to/file");
  });

  it("should ensure tags are unique when multiple are added", () => {
    console.log("Testing unique tag addition...");
    document.updateTags(
      ["tag1", "tag2", "tag3"].map((tag) => TagVO.create({ tag }).unwrap())
    );
    console.log("Updated Tags:", document.getTags());
    expect(document.getTags()).to.deep.equal(["tag1", "tag2", "tag3"]);
  });

  it("should handle update with new tags without affecting existing tags", () => {
    console.log("Testing updating tags...");
    document.updateTags(
      ["newTag1", "newTag2"].map((tag) => TagVO.create({ tag }).unwrap())
    );
    console.log("Updated Tags:", document.getTags());
    expect(document.getTags()).to.deep.equal(["newTag1", "newTag2"]);
  });
});
