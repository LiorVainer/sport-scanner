import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import { CreateGroupPayload } from '../models/group.model';

export const groupController = {
    createGroup: async (req: Request<any, any, CreateGroupPayload>, res: Response) => {
        try {
            const groupData = req.body;
            const userId = req.userId;
            const newGroup = await GroupService.createGroup(groupData, userId);
            res.status(201).send(newGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error creating group', error });
        }
    },

    getGroupById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const group = await GroupService.getGroupById(id);

            if (!group) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(group);
        } catch (error) {
            res.status(500).send({ message: `Error fetching group with ID ${req.params.id}`, error });
        }
    },

    getGroups: async (req: Request, res: Response) => {
        try {
            const userId = req.userId;

            const groups = await GroupService.getGroupsByUserId(userId!);
            res.status(200).send(groups);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching groups for user', error });
        }
    },

    updateGroup: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.userId;

            const updatedGroup = await GroupService.updateGroup(id, { ...updateData, createdBy: req.userId }, userId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: `Error updating group with ID ${req.params.id}`, error });
        }
    },

    deleteGroup: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await GroupService.deleteGroup(id);

            if (!result) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send({ message: 'Group deleted successfully' });
        } catch (error) {
            res.status(500).send({ message: `Error deleting group with ID ${req.params.id}`, error });
        }
    },

    setPackageForGroup: async (req: Request, res: Response) => {
        try {
            const { groupId, packageId } = req.params;
            const updatedGroup = await GroupService.setPackageForGroup(groupId, packageId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error setting package for group', error });
        }
    },

    getGroupsByPackageId: async (req: Request, res: Response) => {
        try {
            const { packageId } = req.params;
            const groups = await GroupService.getGroupsByPackageId(packageId);
            res.status(200).send(groups);
        } catch (error) {
            res.status(500).send({ message: 'Error fetching groups by package ID', error });
        }
    },

    removePackageFromGroup: async (req: Request, res: Response) => {
        try {
            const { groupId } = req.params;
            const updatedGroup = await GroupService.removePackageFromGroup(groupId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error removing package from group', error });
        }
    },

    addSuggestedPackage: async (req: Request, res: Response) => {
        try {
            const { groupId, packageId } = req.params;
            const updatedGroup = await GroupService.addSuggestedPackage(groupId, packageId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error adding suggested package to group', error });
        }
    },

    removeSuggestedPackage: async (req: Request, res: Response) => {
        try {
            const { groupId, packageId } = req.params;
            const updatedGroup = await GroupService.removeSuggestedPackage(groupId, packageId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error removing suggested package from group', error });
        }
    },

    voteForPackage: async (req: Request, res: Response) => {
        try {
            const { groupId, packageId } = req.params;
            const userId = req.userId!;

            const updatedGroup = await GroupService.voteForPackage(groupId, userId, packageId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error voting for package', error });
        }
    },

    removeVote: async (req: Request, res: Response) => {
        try {
            const { groupId } = req.params;
            const userId = req.userId!;

            const updatedGroup = await GroupService.removeVote(groupId, userId);

            if (!updatedGroup) {
                res.status(404).send({ message: 'Group not found' });
                return;
            }

            res.status(200).send(updatedGroup);
        } catch (error) {
            res.status(500).send({ message: 'Error removing vote', error });
        }
    },
};
