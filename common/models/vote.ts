import type { IBaseEntity } from "./baseEntity";

export type SortKeyProperty = "userId";

export interface IVote extends IBaseEntity {
  playerId: string;
  userId: string;
}

export class Vote implements IVote {
  id: string;
  playerId: string;
  userId: string;

  constructor({ id = "", userId = "", playerId = "" }: Partial<IVote> = {}) {
    this.id = id;
    this.playerId = playerId;
    this.userId = userId;
  }

  get dbEntityPrimaryKey() {
    return this.userId;
  }
  get dbEntitySortKey() {
    return this.id;
  }
}
