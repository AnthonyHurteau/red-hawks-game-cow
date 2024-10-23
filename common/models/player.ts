import type { BaseEntity } from "./baseEntity";

export type Position = "F" | "D" | "G";

export interface Player extends BaseEntity {
  firstName: string;
  lastName: string;
  position: Position;
  core: boolean;
}
