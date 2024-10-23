import type { BaseEntity } from "./baseEntity";
import type { Player } from "./player";
import type { Vote } from "./vote";

export interface Game extends BaseEntity {
  date: Date;
  players: Player[];
  votes: Vote[];
}

export interface ActiveGame extends Game {
  isVoteComplete: boolean;
}
