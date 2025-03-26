import { UserPayload } from "../models/user.model";

export type UserWithTokens = UserPayload & {
  _id?: string;
  accessToken?: string;
  refreshToken?: string;
};

export type CreateUserBody = UserPayload;

export type UpdateUserBody = Partial<UserPayload>;
