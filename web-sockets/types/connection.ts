import { IItem } from "../../common/core/src/models/item";

export interface IConnection extends IItem {
    timeToLive: number;
}

export class Connection implements IConnection {
    pk: string;
    timeToLive: number;

    constructor(connectionId: string, timeToLive: number) {
        this.pk = connectionId;
        this.timeToLive = timeToLive;
    }
}
