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
    role: string = "User" // Default role is "User"
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
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

  // Setters (with validation)
  public setId(id: string): void {
    if (!id || id.length === 0) {
      throw new Error("ID cannot be empty.");
    }
    this.id = id;
  }

  public setUsername(username: string): void {
    if (!username || username.length === 0) {
      throw new Error("Username cannot be empty.");
    }
    this.username = username;
  }

  public setEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format.");
    }
    this.email = email;
  }

  public setPassword(password: string): void {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    this.password = password;
  }

  public setRole(role: string): void {
    const validRoles = ["User", "Admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Allowed values: ${validRoles.join(", ")}`);
    }
    this.role = role;
  }
}
