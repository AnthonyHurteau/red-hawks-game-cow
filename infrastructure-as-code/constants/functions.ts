export const API_BASE_PATH = "../../api/src";
export const WS_BASE_PATH = "../../web-sockets/src";
export type FunctionAction =
  | "get"
  | "getList"
  | "create"
  | "update"
  | "delete"
  | "deleteAll"
  | "mock"
  | "connect"
  | "disconnect"
  | "send"
  | "admin"
  | "user";
export const FUNCTION_ACTION: Record<FunctionAction, FunctionAction> = {
  get: "get",
  getList: "getList",
  create: "create",
  update: "update",
  delete: "delete",
  deleteAll: "deleteAll",
  mock: "mock",
  connect: "connect",
  disconnect: "disconnect",
  send: "send",
  admin: "admin",
  user: "user",
};
export const FILE_EXTENSION = "ts";
