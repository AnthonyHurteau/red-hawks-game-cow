export interface IAuth {
  userId: string;
  password: string;
  isAdmin: boolean;
}

export class Auth implements IAuth {
  userId: string;
  password: string;
  isAdmin: boolean;

  constructor(userId: string, password: string, isAdmin = false) {
    this.userId = userId;
    this.password = password;
    this.isAdmin = isAdmin;
  }
}
