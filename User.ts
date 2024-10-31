// // src/entities/User.ts
import {
  BaseEntity,
  IEntity,
  SimpleSerialized,
  Omitt,
} from "@carbonteq/hexapp";
import { UserDoesNotHaveName } from "../errors/user.error";
import { Result } from "@carbonteq/fp";

export interface IUser extends IEntity {
  username: string;
  email: string;
  password: string;
  role: string;
}

export type UserData = Omitt<IUser, keyof IEntity>;

export type UpdateUserData = Partial<IUser>;

export type SerializeUser = SimpleSerialized<IUser>;

export class User extends BaseEntity implements IEntity {
  constructor(
    readonly username: string,
    readonly email: string,
    readonly password: string,
    readonly role: string
  ) {
    super();
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
  }
  update(data: UpdateUserData): Result<User, UserDoesNotHaveName> {
    return this.ensureFilenameExists().map(() => {
      const updated = {
        ...this.serialize(),
        ...data,
      };
      return User.fromSerialized(updated);
    });
  }
  ensureFilenameExists(): Result<this, UserDoesNotHaveName> {
    if (!this.username || this.username.trim().length === 0)
      return Result.Err(new UserDoesNotHaveName());
    return Result.Ok(this);
  }

  static fromSerialized(data: SerializeUser): User {
    const entity = new User(
      data.username,
      data.email,
      data.password,
      data.role
    );
    entity._fromSerialized(data);
    return entity;
  }
  serialize() {
    return {
      ...this._serialize(),
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role,
    };
  }
}
