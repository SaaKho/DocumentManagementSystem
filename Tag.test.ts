import { expect } from "chai";
import { Tag } from "../src/domain/valueObjects/Tag";

describe("Tag Value Object", () => {
  it("should create a tag with a valid name", () => {
    const tag = new Tag("Important");
    expect(tag.getName()).to.equal("Important");
  });

  it("should trim whitespace from the tag name", () => {
    const tag = new Tag("   Urgent   ");
    expect(tag.getName()).to.equal("Urgent"); // Verify trimmed name
  });

  it("should throw an error if the tag name is empty", () => {
    expect(() => new Tag("")).to.throw("Tag name cannot be empty.");
  });

  it("should throw an error if the tag name is only whitespace", () => {
    expect(() => new Tag("    ")).to.throw("Tag name cannot be empty.");
  });

  it("should return true when two tags have the same name", () => {
    const tag1 = new Tag("Project");
    const tag2 = new Tag("Project");
    expect(tag1.equals(tag2)).to.be.true;
  });

  it("should return false when two tags have different names", () => {
    const tag1 = new Tag("Task");
    const tag2 = new Tag("Deadline");
    expect(tag1.equals(tag2)).to.be.false;
  });
});
