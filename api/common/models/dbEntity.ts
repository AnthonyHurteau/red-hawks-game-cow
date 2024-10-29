import { v4 as uuidv4 } from "uuid";
import { BaseEntity } from "../../../common/models/baseEntity";
import { PkType } from "./pkTypes";
import { IndexType } from "aws-sdk/clients/resourceexplorer2";

export interface DbEntity extends BaseEntity {
    pk: string;
    created: string;
    modified: string;
}

export class DbEntityInit implements DbEntity {
    pk: string;
    id: string = uuidv4();
    created: string = new Date().toISOString();
    modified: string = new Date().toISOString();

    constructor(pkType: PkType) {
        this.pk = partitionKey(pkType);
    }
}

export const partitionKey = (type: PkType): string => `Type#${type}`;
export const indexKey = (indexType: IndexType): string => `pk-${indexType}-index`;
