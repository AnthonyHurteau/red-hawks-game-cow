import type { IBaseEntity } from "./baseEntity";

export type SortKeyProperty = "type";
export type UserType = "admin" | "user";

export interface IUser extends IBaseEntity {
  type: UserType;
}

export class User implements IUser {
  id: string;
  type: UserType;

  constructor(id: string = "", type: UserType = "user") {
    this.id = id;
    this.type = type;
  }

  get dbEntityPrimaryKey() {
    return this.id;
  }
  get dbEntitySortKey() {
    return this.type;
  }
}
