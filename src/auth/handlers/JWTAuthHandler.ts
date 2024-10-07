import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthHandler } from "../interfaces/IAuthHandler"; // Importing the IAuthHandler interface
import { IUserRepository } from "../../repository/interfaces/IUser.Repository";
import { User } from "../../entities/User"; 

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export class JwtAuthHandler implements IAuthHandler {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  // Implements the login method for JWT
  async login(username: string, password: string): Promise<string> {
    const user = await this.userRepository.findUserByUsername(username);

    if (!user) {
      console.log("User not found: ", username);
      throw new Error("Invalid username or password");
    }

    // Logging the stored hashed password and plain password
    console.log("Stored hashed password: ", user.getPassword()); // Use the getter for password
    console.log("Plain password being compared: ", password);

    const passwordMatch = await bcrypt.compare(password, user.getPassword()); // Use getter

    if (!passwordMatch) {
      console.log("Password does not match for user: ", username);
      throw new Error("Invalid username or password");
    }

    const token = jwt.sign(
      { id: user.getId(), username: user.getUsername(), role: user.getRole() }, // Use getters
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  }

  // Implements the token verification method for JWT
  async verify(token: string): Promise<boolean> {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }
}
