import { CreateUserDTO, UserDTO } from "../interfaces/user.dto";
import { User } from "@entities/User";


//IUserRepository is an interface that defines the contract for any class that implements it (like UserRepository).
//It describes the methods that must be implemented for interacting with the user data
//(such as finding, creating, updating, or deleting users).
export interface IUserRepository {
  findUserByUsername(username: string): Promise<UserDTO | null>;
  createUser(user: User): Promise<void>;
  updateUser(user: User): Promise<UserDTO | null>;
  deleteUser(userId: string): Promise<boolean>;
}
