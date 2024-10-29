import type { BaseEntity } from "./baseEntity";
import type { Player } from "./player";
import type { Vote } from "./vote";

export interface Game extends BaseEntity {
  date: Date;
  players: Player[];
  votes: Vote[];
}

export class GameInit implements Game {
  id = "";
  date: Date = new Date();
  players: Player[] = [];
  votes: Vote[] = [];
}

export interface ActiveGame extends Game {
  isVoteComplete: boolean;
}

export class ActiveGameInit implements ActiveGame {
  id = "";
  date: Date = new Date();
  players: Player[] = [];
  votes: Vote[] = [];
  isVoteComplete: boolean = false;
}
