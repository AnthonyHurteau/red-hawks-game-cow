import type { BaseEntity } from "./baseEntity";

export interface Vote extends BaseEntity {
  playerId: string;
  userId: string;
}

export class VoteInit implements Vote {
  id: string = "";
  playerId: string = "";
  userId: string = "";
}
