// src/entities/User.ts
export class User {
  private id: string;
  private username: string;
  private email: string;
  private password: string;
  private role: string;

  constructor(
    id: string,
    username: string,
    email: string,
    password: string,
    role: string = "User"
  ) {
    if (!id || id.length === 0) {
      throw new Error("ID cannot be empty.");
    }
    this.id = id;

    if (!username || username.length === 0) {
      throw new Error("Username cannot be empty.");
    }
    this.username = username;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format.");
    }
    this.email = email;

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    this.password = password;

    const validRoles = ["User", "Admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Allowed values: ${validRoles.join(", ")}`);
    }
    this.role = role;
  }

  // Method to initialize ID after construction, if needed
  public initializeId(id: string): void {
    if (!this.id) {
      this.id = id;
    }
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getRole(): string {
    return this.role;
  }

  // Public methods for updating properties with encapsulated logic
  public updateUsername(username: string): void {
    if (!username || username.length === 0) {
      throw new Error("Username cannot be empty.");
    }
    this.username = username;
  }

  public updateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format.");
    }
    this.email = email;
  }

  public updatePassword(password: string): void {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    this.password = password;
  }

  public updateRole(role: string): void {
    const validRoles = ["User", "Admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Allowed values: ${validRoles.join(", ")}`);
    }
    this.role = role;
  }
}
