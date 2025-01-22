import { IGame, Game, SortKeyProperty, GameType } from "common/models/game";
import { generateUuid } from "../services/uuidHelper";
import { DbEntity, IDbEntity } from "./dbEntity";
import { OmittedProps } from "common/models/baseEntity";
import { IPlayer } from "common/models/player";
import { IVote } from "common/models/vote";

export interface IGameDbEntity extends IDbEntity, Omit<IGame, OmittedProps | SortKeyProperty> {}

export class GameDbEntity extends DbEntity implements IGameDbEntity {
    date: Date;
    isVoteComplete: boolean;
    players: IPlayer[];
    votes: IVote[];

    constructor(game: IGame, timeToLive: number | null = null) {
        super(game.type, generateUuid(), timeToLive);
        this.date = game.date;
        this.isVoteComplete = game.isVoteComplete;
        this.players = game.players;
        this.votes = game.votes;
    }
}

export class GameDto extends Game implements IGame {
    constructor(gameDbEntity: IGameDbEntity) {
        super(
            gameDbEntity.sk,
            gameDbEntity.pk as GameType,
            gameDbEntity.date,
            gameDbEntity.isVoteComplete,
            gameDbEntity.players,
            gameDbEntity.votes,
        );
    }
}
