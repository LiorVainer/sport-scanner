import {NextFunction, Request, Response} from "express";
import {context} from "../context";
import {v4 as uuid} from 'uuid';

export const requestContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || uuid();
    const headers = req.headers;
    const body = req.body;
    const store = {requestId, headers, body};

    context.run(store, () => {
        next();
    });
};