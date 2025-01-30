import { IndexType } from "aws-sdk/clients/resourceexplorer2";

export interface IDbEntity {
    pk: string;
    sk: string;
    created: string;
    modified: string;
    timeToLive: number | null;
}

export class DbEntity implements IDbEntity {
    pk: string;
    sk: string;
    created: string = new Date().toISOString();
    modified: string = new Date().toISOString();
    timeToLive: number | null;

    constructor(pk: string, sk: string, timeToLive: number | null = null) {
        this.pk = pk;
        this.sk = sk;
        this.timeToLive = timeToLive;
    }
}
