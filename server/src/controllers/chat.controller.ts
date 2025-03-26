import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { chatService } from '../services/chat.service';
import { GetChatQueryParams } from '../models/chat.model';

export const chatController = {
    getChats: async (req: Request<unknown, unknown, unknown, GetChatQueryParams>, res: Response) => {
        try {
            const { matchExperienceId, visitorId, matchExperienceCreatorId } = req.query;

            if (!matchExperienceId || !mongoose.Types.ObjectId.isValid(matchExperienceId)) {
                res.status(400).json({ error: 'Invalid or missing matchExperienceId' });
                return;
            }

            if (visitorId && matchExperienceCreatorId) {
                const chat = await chatService.getChatBetweenUsers(
                    matchExperienceId,
                    visitorId,
                    matchExperienceCreatorId
                );
                res.status(200).json(chat);
                return;
            }

            const chats = await chatService.getChatsForMatchExperience(matchExperienceId);
            res.status(200).json(chats);
            return;
        } catch (error) {
            res.status(500).json({ error: 'Error fetching chats' });
            return;
        }
    },
};
