import { NextFunction, Request, Response } from 'express';
import { ENV } from '../env/env.config';

export const handleErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        stack: ENV.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
