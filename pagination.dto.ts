export interface Document {
  id: string;
  fileName: string;
  fileExtension: string;
  contentType: string;
  tags: string[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
