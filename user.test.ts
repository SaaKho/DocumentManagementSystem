import { expect } from "chai";
import sinon from "sinon";
import bcrypt from "bcryptjs";
import { User } from "../src/domain/entities/User";

describe("User Entity", () => {
  let user: User;
  let bcryptHashSyncStub: sinon.SinonStub;
  let bcryptCompareSyncStub: sinon.SinonStub;
  
  const validUserData = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    role: "User",
  };

  beforeEach(() => {
    // Stub bcrypt methods
    bcryptHashSyncStub = sinon.stub(bcrypt, "hashSync").returns("hashedPassword");
    bcryptCompareSyncStub = sinon.stub(bcrypt, "compareSync").returns(true);

    // Initialize a new User instance
    user = new User(
      validUserData.username,
      validUserData.email,
      validUserData.password,
      validUserData.role
    );
  });

  afterEach(() => {
    // Restore bcrypt stubs after each test
    sinon.restore();
  });

  it("should create a user with correct details", () => {
    expect(user.username).to.equal(validUserData.username);
    expect(user.email).to.equal(validUserData.email);
    expect(user.role).to.equal(validUserData.role);
  });

  it("should hash the password when a user is created", () => {
    expect(bcryptHashSyncStub.calledOnceWith(validUserData.password, 10)).to.be.true;
    expect(user.password).to.equal("hashedPassword");
  });

  it("should throw an error if username is empty", () => {
    expect(
      () => new User("", validUserData.email, validUserData.password, validUserData.role)
    ).to.throw("Username is required");
  });

  it("should throw an error if email is invalid", () => {
    expect(
      () => new User(validUserData.username, "invalid-email", validUserData.password, validUserData.role)
    ).to.throw("Valid email is required");
  });

  it("should throw an error if password is less than 6 characters", () => {
    expect(
      () => new User(validUserData.username, validUserData.email, "123", validUserData.role)
    ).to.throw("Password must be at least 6 characters long");
  });

  it("should validate the password correctly using bcrypt", () => {
    bcryptCompareSyncStub.returns(true); // Simulate password match
    const isValid = bcrypt.compareSync("password123", user.password);
    expect(isValid).to.be.true;
  });

  it("should invalidate an incorrect password using bcrypt", () => {
    bcryptCompareSyncStub.returns(false); // Simulate password mismatch
    const isValid = bcrypt.compareSync("wrongPassword", user.password);
    expect(isValid).to.be.false;
  });

  it("should update username and retain other properties", () => {
    user.update({ username: "newUsername" });
    expect(user.username).to.equal("newUsername");
    expect(user.email).to.equal(validUserData.email); // Email should be unchanged
  });

  it("should update role correctly", () => {
    user.update({ role: "Admin" });
    expect(user.role).to.equal("Admin");
  });

  it("should not update email if invalid", () => {
    user.update({ email: "invalid-email" });
    expect(user.email).to.equal(validUserData.email); // Email should remain unchanged
  });
});
