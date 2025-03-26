import { Request, RequestHandler, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserDocument, UserRepository } from '../repositories/user.repository';
import { RefreshResponse, RefreshTokenBody, Tokens } from '../types/auth.types';
import { PublicUser, User, UserPayload } from '../models/user.model';
import { OAuth2Client } from 'google-auth-library';
import { ENV } from '../env/env.config';

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

export const register: RequestHandler<Record<any, any>, User | unknown, UserPayload> = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const userPayload = {
            email: req.body.email,
            password: hashedPassword,
            username: req.body.username,
            picture: req.body.picture,
        };
        const user = await UserRepository.create(userPayload);
        const { password: _password, refreshTokens, ...publicUser } = user.toObject();

        const userResponsePayload: PublicUser = {
            ...publicUser,
            _id: user._id.toString(),
        };

        const tokens = generateTokens(userResponsePayload);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }

        user.refreshTokens?.push(tokens.refreshToken);
        await user.save();

        res.status(200).send({ ...userResponsePayload, ...tokens });
    } catch (err) {
        res.status(500).send(err);
    }
};

export const generateTokens = (user: PublicUser): Tokens | null => {
    const accessToken = jwt.sign(user, ENV.TOKEN_SECRET, {
        expiresIn: ENV.TOKEN_EXPIRES as SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(user, ENV.TOKEN_SECRET, {
        expiresIn: ENV.REFRESH_TOKEN_EXPIRES as SignOptions['expiresIn'],
    });

    return {
        accessToken,
        refreshToken,
    };
};

export const login = async (req: Request, res: Response) => {
    try {
        const user = await UserRepository.findOne({ email: req.body.email });
        if (!user) {
            res.status(401).send('wrong username or password');
            return;
        }
        const validPassword = await bcryptjs.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(401).send('wrong username or password');
            return;
        }
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }

        const { password, refreshTokens, ...publicUser } = user.toObject();

        const userResponsePayload: PublicUser = {
            ...publicUser,
            _id: user._id.toString(),
        };

        const tokens = generateTokens(userResponsePayload);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }

        user.refreshTokens?.push(tokens.refreshToken);
        await user.save();

        res.status(200).send({
            ...tokens,
            ...userResponsePayload,
        });
    } catch (err) {
        res.status(500).send(err);
    }
};

const verifyRefreshToken = async (refreshToken: string | undefined) => {
    if (!refreshToken) {
        throw new Error('Invalid Refresh Token');
    }

    let user: UserDocument | null = null;

    try {
        const payload = jwt.verify(refreshToken, ENV.TOKEN_SECRET) as PublicUser;
        user = await UserRepository.findById(payload._id);

        if (!user) {
            return null;
        }

        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            user.refreshTokens = [];
            await user.save();
            return null;
        }

        // update user refresh tokens array to be the same as before except the current refresh token
        user.refreshTokens = user.refreshTokens?.filter((token) => token !== refreshToken);
    } catch (err) {
        return null;
    }

    return user;
};

export const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send('Invalid refresh token');
            return;
        }
        await user.save();
        res.status(200).send('Logged out successfully');
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

export const refresh: RequestHandler<Record<any, any>, RefreshResponse | string, RefreshTokenBody> = async (
    req,
    res
) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send('Invalid refresh token');
            return;
        }

        const { refreshTokens, ...userPayload } = user.toObject();

        const publicUser: PublicUser = {
            ...userPayload,
            _id: user._id.toString(),
        };

        const tokens = generateTokens(publicUser);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }

        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }

        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

/* istanbul ignore next */
export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).send('Invalid Google token');
            return;
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: ENV.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return;
        }

        let user = await UserRepository.findOne({ email: payload.email });

        if (!user) {
            user = await UserRepository.create({
                email: payload.email,
                username: payload.name || '',
                picture: payload.picture || '',
                googleId: payload.sub,
            });
        }

        const { refreshTokens, ...userPayload } = user.toObject();

        const publicUser: PublicUser = {
            ...userPayload,
            _id: user._id.toString(),
        };

        const tokens = generateTokens(publicUser);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }

        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }

        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        res.status(200).send({
            ...tokens,
            ...publicUser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).send('Token not found');
            return;
        }

        let publicUser: PublicUser | null = null;
        try {
            publicUser = jwt.verify(token, ENV.TOKEN_SECRET) as PublicUser;
            let user = await UserRepository.findOne({ email: publicUser.email });
            if (!user) {
                res.status(401).send('Invalid token');
                return;
            }
            const { password, refreshTokens, ...userPayload } = user.toObject();
            res.status(200).send(userPayload);
        } catch (e) {
            res.status(401).send('Invalid token');
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
