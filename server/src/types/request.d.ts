import { NextFunction, Request, Response } from 'express';

declare module 'express' {
    export interface Request {
        userId?: string;
    }
}
