import { IBaseEntity } from "common/models/baseEntity";

export type WsEvent = "INSERT" | "MODIFY" | "REMOVE";

export interface IWsEntity<T extends IBaseEntity> {
    event: WsEvent;
    data: T;
}

export class WsEntity<T extends IBaseEntity> implements IWsEntity<T> {
    event: WsEvent;
    data: T;

    constructor(event: WsEvent, data: T) {
        this.event = event;
        this.data = data;
    }
}
