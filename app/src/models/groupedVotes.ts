import type { IVote } from "@common/models/vote"

export interface IGroupedVotes {
  [playerId: string]: IVote[]
}
