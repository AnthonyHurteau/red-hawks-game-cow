export type Position = "F" | "D" | "G";

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: Position;
  core: boolean;
}
