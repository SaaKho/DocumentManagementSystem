//The purpose of a DTO is to define the structure of the data that will be transferred between different layers 
//of the application (e.g., from a service to a repository).
//In this case, CreateUserDTO is used to define the properties needed when creating a user. 
//It ensures that only the relevant fields (like username, email, password, and role) are passed when creating a user, 
//without requiring other fields that may exist in the full User entity.

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role: string;
}


//The User interface defines the complete structure of a user entity as it exists in the database. 
//This includes fields like created_at and updated_at, which are generally not part of the data transfer 
//when creating or updating a user but exist in the database for record-keeping purposes.
export interface UserDTO {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    created_at: Date | null;
    updated_at: Date | null;
  }
