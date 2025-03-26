import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserBody, UpdateUserBody } from '../types/user.types';

export const userController = {
    updateUserById: async (req: Request<Record<any, any>, {}, UpdateUserBody>, res: Response) => {
        try {
            const userId = req.params.id;
            const user = await UserRepository.findById(userId);
            if (!user) {
                res.status(404).send({ message: 'User not found' });
                return;
            }

            const updatedUser = await UserRepository.findByIdAndUpdate(userId, req.body, { new: true });
            if (!updatedUser) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            const { password, refreshTokens, ...publicUser } = updatedUser.toObject();
            res.status(200).send(publicUser);
        } catch (err) {
            res.status(500).send({ message: 'Error updating user', error: err });
        }
    },
};
