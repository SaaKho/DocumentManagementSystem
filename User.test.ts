import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import { User } from "../src/domain/entities/User";

describe("User Entity", () => {
  let user: User;

  beforeEach(() => {
    // Use correct casing for role, e.g., "User" or "Admin"
    user = new User("1", "testUser", "test@example.com", "Password123", "User");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a user with correct details", () => {
    expect(user.getId()).to.equal("1");
    expect(user.getUsername()).to.equal("testUser");
    expect(user.getEmail()).to.equal("test@example.com");
    expect(user.getRole()).to.equal("User");
  });

  it("should validate email correctly", () => {
    expect(() => user.updateEmail("invalidEmail")).to.throw(
      "Invalid Email Format"
    ); // Match exact error message
  });
  it("should set password correctly", () => {
    const password = "Password123";
    user.updatePassword(password);

    // Since there's no hashing, we expect the password to match the input directly
    expect(user.getPassword()).to.equal(password);
  });

  it("should allow role change", () => {
    user.updateRole("Admin");
    expect(user.getRole()).to.equal("Admin");
  });
});
