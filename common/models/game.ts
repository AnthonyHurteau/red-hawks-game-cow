import type { IBaseEntity } from "./baseEntity";
import type { IPlayer } from "./player";
import type { IVote } from "./vote";

export type SortKeyProperty = "type";
export type GameType = "active" | "completed";

export interface IGame extends IBaseEntity {
  type: GameType;
  date: string;
  isVoteComplete: boolean;
  players: IPlayer[];
  votes: IVote[];
}

export class Game implements IGame {
  id: string;
  type: GameType;
  date: string;
  isVoteComplete: boolean;
  players: IPlayer[];
  votes: IVote[];

  constructor({
    id = "",
    type = "active",
    date = new Date().toISOString(),
    isVoteComplete = false,
    players = [],
    votes = [],
  }: Partial<IGame> = {}) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.isVoteComplete = isVoteComplete;
    this.players = players;
    this.votes = votes;
  }

  get dbEntityPrimaryKey() {
    return this.type;
  }
  get dbEntitySortKey() {
    return this.id;
  }
}
