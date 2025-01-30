import { IVote, Vote, SortKeyProperty } from "common/models/vote";
import { generateUuid } from "../services/uuidHelper";
import { DbEntity, IDbEntity } from "./dbEntity";
import { OmittedProps } from "common/models/baseEntity";

export interface IVoteDbEntity extends IDbEntity, Omit<IVote, OmittedProps | SortKeyProperty> {}

export class VoteDbEntity extends DbEntity implements IVoteDbEntity {
    playerId: string;

    constructor(vote: IVote, timeToLive: number | null = null) {
        super(vote.userId, generateUuid(), timeToLive);
        this.playerId = vote.playerId;
    }
}

export class VoteDto extends Vote implements IVote {
    constructor(voteDbEntity: IVoteDbEntity) {
        super({ id: voteDbEntity.sk, userId: voteDbEntity.pk, ...voteDbEntity });
    }
}
