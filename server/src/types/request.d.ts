import {PublicUser} from "../models/user.model";

declare module 'express' {
    export interface Request {
        userId?: string;
        user?: PublicUser;
    }
}
