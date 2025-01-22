import { DbEntity, IDbEntity } from "./dbEntityV2";
import { IPlayer, Player, PlayerType, Position } from "../../../../common/models/player";
import { generateUuid } from "../services/uuidHelper";
import { OmittedProps } from "./baseEntity";

export interface IPlayerDbEntity extends IDbEntity, Omit<IPlayer, OmittedProps | "type"> {}

export class PlayerDbEntity extends DbEntity implements IPlayerDbEntity {
    firstName: string;
    lastName: string;
    position: Position;

    constructor(player: IPlayer, timeToLive: number | null = null) {
        super(player.type, generateUuid(), timeToLive);
        this.firstName = player.firstName;
        this.lastName = player.lastName;
        this.position = player.position;
    }
}

export class PlayerDto extends Player implements IPlayer {
    constructor(playerDbEntity: IPlayerDbEntity) {
        super(
            playerDbEntity.pk,
            playerDbEntity.sk as PlayerType,
            playerDbEntity.firstName,
            playerDbEntity.lastName,
            playerDbEntity.position as Position,
        );
    }
}
