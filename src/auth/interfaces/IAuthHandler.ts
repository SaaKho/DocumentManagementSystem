// src/auth/interfaces/IAuthHandler.ts
export interface IAuthHandler {
  login(username: string, password: string): Promise<string>;
  verify(token: string): Promise<boolean>;
}
