import { IBaseEntity } from "common/models/baseEntity";

export type WsEvent = "INSERT" | "MODIFY" | "REMOVE";

export interface IWsEntity {
    event: WsEvent;
    data: IBaseEntity;
}

export class WsEntity implements IWsEntity {
    event: WsEvent;
    data: IBaseEntity;

    constructor(event: WsEvent, data: IBaseEntity) {
        this.event = event;
        this.data = data;
    }
}
