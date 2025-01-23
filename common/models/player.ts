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

  constructor({
    id = "",
    type = "sub",
    firstName = "",
    lastName = "",
    position = "F",
  }: Partial<IPlayer> = {}) {
    this.id = id;
    this.type = type;
    this.firstName = firstName;
    this.lastName = lastName;
    this.position = position;
  }

  get dbEntityPrimaryKey() {
    return this.type;
  }
  get dbEntitySortKey() {
    return this.id;
  }
}
