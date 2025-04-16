// middlewares/jwt-parser.middleware.ts
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {PublicUser} from '../models/user.model';
import {ENV} from '../env/env.config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
        res.status(401).json({message: 'Unauthorized'});
        return;
    }
    next();
};

type JwtPayload = PublicUser & {
    iat: number;
    exp: number;
    __v: number;
}

export const jwtParserMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const payload = jwt.verify(token, ENV.TOKEN_SECRET) as JwtPayload;
        const {iat, exp, __v, ...user} = payload;
        req.userId = payload._id;
        req.user = user;
    } catch {
    }

    next();
};

