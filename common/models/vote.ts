import { IBaseEntity } from "./baseEntity";

export type SortKeyProperty = "userId";

export interface IVote extends IBaseEntity {
  playerId: string;
  userId: string;
}

export class Vote implements IVote {
  id: string;
  playerId: string;
  userId: string;

  constructor(id: string = "", userId: string = "", playerId: string = "") {
    this.id = id;
    this.playerId = playerId;
    this.userId = userId;
  }

  get dbEntityPrimaryKey() {
    return this.id;
  }
  get dbEntitySortKey() {
    return this.userId;
  }
}
