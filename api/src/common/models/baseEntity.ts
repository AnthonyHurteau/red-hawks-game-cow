export type OmittedProps = "id" | "dbEntityPrimaryKey" | "dbEntitySortKey";

export interface IBaseEntity {
    id: string;
    dbEntityPrimaryKey: string;
    dbEntitySortKey: string;
}
