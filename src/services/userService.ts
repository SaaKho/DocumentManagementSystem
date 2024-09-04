// userService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/userRepository";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const userRepository = new UserRepository();

export const registerNewUserService = async (
  username: string,
  email: string,
  password: string
) => {
  const newUser = await userRepository.createUser(username, email, password);
  return newUser;
};

export const registerNewAdminService = async (
  username: string,
  email: string,
  password: string
) => {
  const newAdmin = await userRepository.createUser(
    username,
    email,
    password,
    "Admin"
  );
  return newAdmin;
};

export const loginService = async (username: string, password: string) => {
  const result = await userRepository.findUserByUsername(username);

  const user = result[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

// export const updateUserService = async (
//   id: string,
//   username: string,
//   email: string,
//   password: string,
//   role: string
// ) => {
//   const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

//   const updatedUser = await userRepository.createUser(
//     username,
//     email,
//     hashedPassword || "",
//     role ? role.toLowerCase() : "User"
//   );

//   return updatedUser;
// };

export const updateUserService = async (
  id: string,
  username: string,
  email: string,
  password: string,
  role: string
) => {
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  // The issue could be here: Instead of creating a new user, you should update the existing user.
  const updatedUser = await userRepository.updateUser(
    id, // Make sure you're updating the user by `id`
    username,
    email,
    hashedPassword || "", // Passing empty password instead of updating with hashedPassword
    role ? role.toLowerCase() : "User"
  );

  return updatedUser;
};

export const deleteUserService = async (id: string) => {
  const deleteResult = await userRepository.deleteUser(id);

  if (!deleteResult.rowCount || deleteResult.rowCount === 0) {
    throw new Error("User not found");
  }

  return deleteResult;
};
