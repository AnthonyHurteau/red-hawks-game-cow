import { IUser, SortKeyProperty, User, UserType } from "common/models/user";
import { generateUuid } from "../services/uuidHelper";
import { DbEntity, IDbEntity } from "./dbEntity";
import { OmittedProps } from "common/models/baseEntity";

export interface IUserDbEntity extends IDbEntity, Omit<IUser, OmittedProps | SortKeyProperty> {}

export class UserDbEntity extends DbEntity implements IUserDbEntity {
    constructor(user: IUser, timeToLive: number | null = null) {
        super(user.type, user.id !== "" ? user.id : generateUuid(), timeToLive);
    }
}

export class UserDto extends User implements IUser {
    constructor(voteDbEntity: IUserDbEntity) {
        super(voteDbEntity.sk, voteDbEntity.pk as UserType);
    }
}
