import { IUser, User } from "./user";

export interface IAuth extends IUser {
  password: string;
}

export class Auth extends User implements IAuth {
  password: string;

  constructor(user: IUser, password: string) {
    super(user);
    this.password = password;
  }
}
