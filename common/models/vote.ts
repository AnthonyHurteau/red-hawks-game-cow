import type { BaseEntity } from "./baseEntity";

export interface Vote extends BaseEntity {
  playerId: string;
  userId: string;
}
