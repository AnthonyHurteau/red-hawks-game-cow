import { IUser, SortKeyProperty, User, UserType } from "common/models/user";
import { generateUuid } from "../services/uuidHelper";
import { DbEntity, IDbEntity } from "./dbEntity";
import { OmittedProps } from "common/models/baseEntity";

export interface IUserDbEntity extends IDbEntity, Omit<IUser, OmittedProps | SortKeyProperty> {}

export class UserDbEntity extends DbEntity implements IUserDbEntity {
    userAgent: string;
    lastLogin: string;
    constructor(user: IUser, timeToLive: number | null = null) {
        const userId = user.id !== "" ? user.id : generateUuid();
        super(userId, user.type, timeToLive);
        this.userAgent = user.userAgent;
        this.lastLogin = user.lastLogin;
    }
}

export class UserDto extends User implements IUser {
    constructor(voteDbEntity: IUserDbEntity) {
        super({
            id: voteDbEntity.pk,
            type: voteDbEntity.sk as UserType,
            ...voteDbEntity,
        });
    }
}
