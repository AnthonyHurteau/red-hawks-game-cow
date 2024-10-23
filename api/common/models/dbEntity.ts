export interface DbEntity {
    created: string;
    modified: string;
}

export class DbEntityInit implements DbEntity {
    created: string;
    modified: string;

    constructor() {
        this.created = "";
        this.modified = "";
    }
}
