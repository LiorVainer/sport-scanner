import { Request, Response } from 'express';
import { UpdateUserBody } from '../types/user.types';
import { UserService } from '../services/user.service';

export const userController = {
    updateUserById: async (req: Request<Record<any, any>, {}, UpdateUserBody>, res: Response) => {
        try {
            const updatedUser = await UserService.updateUserById(req.params.id, req.body);
            if (!updatedUser) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            const { password, refreshTokens, ...publicUser } = updatedUser;
            res.status(200).send(publicUser);
        } catch (err) {
            res.status(500).send({ message: 'Error updating user', error: err });
        }
    },

    getUsersHistory: async (req: Request, res: Response) => {
        try {
            const history = await UserService.getUsersHistory(req.userId!);
            res.status(200).send(history);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addToUsersHistory: async (req: Request, res: Response) => {
        try {
            const newEntry = await UserService.addToUsersHistory(req.userId!, req.params.packageId);
            res.status(200).send(newEntry);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    getUsersSavedPackages: async (req: Request, res: Response) => {
        try {
            const packages = await UserService.getUsersSavedPackages(
                req.userId!,
                req.query.packageId as string | undefined
            );
            res.status(200).send(packages);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    savePackageForUser: async (req: Request, res: Response) => {
        try {
            const saved = await UserService.savePackage(req.userId!, req.params.packageId);
            res.status(200).send(saved);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    unsavePackageForUser: async (req: Request, res: Response) => {
        try {
            const removed = await UserService.unsavePackage(req.userId!, req.params.packageId);
            res.status(200).send(removed);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    getUsers: async (req: Request, res: Response) => {
        try {
          const { username } = req.query;
          const users = await UserService.getUsers(username as string);
          res.status(200).send(users);
        } catch (err) {
          res.status(500).send({ message: 'Error fetching users', error: err });
        }
    },
      
    getUsersSuggestedPackages: async (req: Request, res: Response) => {
        try {
            const userWithPackages = await UserService.getSuggestedPackages(req.userId!);
            res.status(200).send(userWithPackages?.suggestedPackages || []);
        } catch (err) {
            res.status(500).send({ message: 'Failed to get suggested packages', error: err });
        }
    },
};
