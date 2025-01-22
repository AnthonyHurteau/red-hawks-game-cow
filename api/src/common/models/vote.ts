import { IVote, Vote } from "../../../../common/models/vote";
import { generateUuid } from "../services/uuidHelper";
import { OmittedProps } from "./baseEntity";
import { DbEntity, IDbEntity } from "./dbEntityV2";

export interface IVoteDbEntity extends IDbEntity, Omit<IVote, OmittedProps | "userId"> {}

export class VoteDbEntity extends DbEntity implements IVoteDbEntity {
    playerId: string;

    constructor(vote: IVote, timeToLive: number | null = null) {
        super(vote.userId, generateUuid(), timeToLive);
        this.playerId = vote.playerId;
    }
}

export class VoteDto extends Vote implements IVote {
    constructor(voteDbEntity: IVoteDbEntity) {
        super(voteDbEntity.sk, voteDbEntity.pk, voteDbEntity.playerId);
    }
}
