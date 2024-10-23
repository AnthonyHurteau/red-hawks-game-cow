import type { BaseEntity } from "./baseEntity";

export interface User extends BaseEntity {
  deviceId: string;
  isAdmin: boolean;
}
