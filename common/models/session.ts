import type { IUser } from "./user";

// Returned when a user is created or made admin. The app stores the token
// and sends it as "Authorization: Bearer <token>".
export interface ISession {
  user: IUser;
  token: string;
}
