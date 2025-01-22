import { IBaseEntity } from "./baseEntity";
import type { IPlayer } from "./player";
import type { IVote } from "./vote";

export type SortKeyProperty = "type";
export type GameType = "active" | "completed";

export interface IGame extends IBaseEntity {
  type: GameType;
  date: Date;
  isVoteComplete: boolean;
  players: IPlayer[];
  votes: IVote[];
}

export class Game implements IGame {
  id: string;
  type: GameType;
  date: Date;
  isVoteComplete: boolean;
  players: IPlayer[];
  votes: IVote[];

  constructor(
    id: string = "",
    type: GameType = "active",
    date: Date = new Date(),
    isVoteComplete: boolean,
    players: IPlayer[] = [],
    votes: IVote[] = []
  ) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.isVoteComplete = isVoteComplete;
    this.players = players;
    this.votes = votes;
  }

  get dbEntityPrimaryKey() {
    return this.id;
  }
  get dbEntitySortKey() {
    return this.type;
  }
}
