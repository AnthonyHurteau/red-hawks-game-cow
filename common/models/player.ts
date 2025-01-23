import type { IBaseEntity } from "./baseEntity";

export type SortKeyProperty = "type";
export type Position = "F" | "D" | "G";
export type PlayerType = "core" | "sub";

export interface IPlayer extends IBaseEntity {
  firstName: string;
  lastName: string;
  position: Position;
  type: PlayerType;
}

export class Player implements IPlayer {
  id: string;
  type: PlayerType;
  firstName: string;
  lastName: string;
  position: Position;

  constructor(
    id: string = "",
    type: PlayerType = "sub",
    firstName: string = "",
    lastName: string = "",
    position: Position = "F"
  ) {
    this.id = id;
    this.type = type;
    this.firstName = firstName;
    this.lastName = lastName;
    this.position = position;
  }

  get dbEntityPrimaryKey() {
    return this.id;
  }
  get dbEntitySortKey() {
    return this.type;
  }
}
