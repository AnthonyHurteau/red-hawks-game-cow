import type { IBaseEntity } from "./baseEntity";

export type SortKeyProperty = "type";
export type UserType = "admin" | "user";

export interface IUser extends IBaseEntity {
  type: UserType;
  userAgent: string;
  lastLogin: string;
}

export class User implements IUser {
  id: string;
  type: UserType;
  userAgent: string;
  lastLogin: string;

  constructor({
    id = "",
    type = "user",
    userAgent = navigator.userAgent,
    lastLogin = new Date().toISOString(),
  }: Partial<IUser> = {}) {
    this.id = id;
    this.type = type;
    this.userAgent = userAgent;
    this.lastLogin = lastLogin;
  }

  get dbEntityPrimaryKey() {
    return this.id;
  }
  get dbEntitySortKey() {
    return this.type;
  }
}
