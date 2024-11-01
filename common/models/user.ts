import type { BaseEntity } from "./baseEntity";

export interface User extends BaseEntity {
  isAdmin: boolean;
}
