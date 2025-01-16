import type { Vote } from "./vote";

export interface GroupedVotes {
  [playerId: string]: Vote[];
}
