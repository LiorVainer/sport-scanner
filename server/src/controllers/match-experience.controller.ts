import { Request, Response } from 'express';
import { MatchExperienceRepository } from '../repositories/match-experience.repository';
import { CommentRepository } from '../repositories/comment.repository';
import mongoose from 'mongoose';
import { CreateCommentDTO } from '../models/comment.model';
import { matchExperienceService } from '../services/match-experience.service';
import { AIService } from '../services/ai.service';
import { formatObject } from '../utils/formatObject.utils';
import dotenv from 'dotenv';
import { ENV } from '../env/env.config';

dotenv.config();

const PAGE_DEFAULT = ENV.PAGE_DEFAULT || 1;
const LIMIT_DEFAULT = ENV.LIMIT_DEFAULT || 5;

export const matchExperienceController = {
    createMatchExperience: async (req: Request, res: Response) => {
        try {
            const matchExperience = await MatchExperienceRepository.create({
                ...req.body,
                createdBy: req.userId,
            });
            res.status(200).send(matchExperience);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || PAGE_DEFAULT;
            const limit = parseInt(req.query.limit as string) || LIMIT_DEFAULT;
            const sortBy = (req.query.sortBy as string) || 'date';

            const result = await matchExperienceService.getAllMatchExperiences(page, limit, sortBy);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching matchExperiences', details: err });
        }
    },

    getAllByUserId: async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page as string) || PAGE_DEFAULT;
            const limit = parseInt(req.query.limit as string) || LIMIT_DEFAULT;
            const sortBy = (req.query.sortBy as string) || 'date';

            if (userId) {
                const result = await matchExperienceService.getAllMatchExperiencesByUserId(userId, page, limit, sortBy);
                res.status(200).json(result);
                return
            }
            res.status(500).json({ error: 'Error fetching match experiences for user'});
        } catch (err) {
            res.status(500).json({ error: `Error fetching match experiences for user`, details: err });
        }
    },

    getMatchExperienceById: async (req: Request, res: Response) => {
        try {
            const matchExpId = req.params.id;
            const result = await matchExperienceService.getMatchExperienceById(matchExpId);

            if (!result) {
                res.status(404).send('MatchExperience not found');
                return;
            }
            res.status(200).send(result);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    updateMatchExperience: async (req: Request, res: Response) => {
        try {
            const matchExperience = await MatchExperienceRepository.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            if (!matchExperience) {
                res.status(404).send('MatchExperience not found');
                return;
            }
            res.status(200).send(matchExperience);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    deleteMatchExperience: async (req: Request, res: Response) => {
        try {
            const matchExperience = await MatchExperienceRepository.findByIdAndDelete(req.params.id);
            if (!matchExperience) {
                res.status(404).send('MatchExperience not found');
                return;
            }
            res.status(200).send('MatchExperience deleted successfully');
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addComment: async (req: Request, res: Response) => {
        try {
            const matchExperienceId = req.params.id;
            const { content } = req.body;
            const userId = new mongoose.Types.ObjectId(req.userId);

            const matchExperience = await MatchExperienceRepository.findById(matchExperienceId);
            if (!matchExperience) {
                res.status(404).send('MatchExperience not found');
                return;
            }

            const newComment: CreateCommentDTO = {
                matchExperienceId: new mongoose.Types.ObjectId(matchExperienceId),
                userId,
                content,
            };

            const message = await CommentRepository.create(newComment);

            res.status(200).send(message.id);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    likeMatchExperience: async (req: Request, res: Response) => {
        try {
            const matchExperienceId = req.params.id;
            const userId = new mongoose.Types.ObjectId(req.userId);

            const matchExperience = await MatchExperienceRepository.findByIdAndUpdate(
                matchExperienceId,
                { $addToSet: { likes: userId } },
                { new: true }
            );
            if (!matchExperience) {
                res.status(404).send('MatchExperience not found');
                return;
            }
            res.status(200).send({ ok: true });
        } catch (err) {
            res.status(500).send(err);
        }
    },

    unlikeMatchExperience: async (req: Request, res: Response) => {
        try {
            const matchExperienceId = req.params.id;
            const userId = new mongoose.Types.ObjectId(req.userId);

            const matchExperience = await MatchExperienceRepository.findByIdAndUpdate(
                matchExperienceId,
                { $pull: { likes: userId } },
                { new: true }
            );
            if (!matchExperience) {
                res.status(404).send('MatchExperience not found');
                return;
            }
            res.status(200).send({ ok: true });
        } catch (err) {
            res.status(500).send(err);
        }
    },

    /* istanbul ignore next */
    betterDescription: async (req: Request, res: Response) => {
        try {
            const prompt = `Generate a short, engaging match experience description based on these details. 
            Capture the emotions, key moments, and atmosphere in a concise way. 
            Only return the description itself—do not include introductions, explanations, or extra text. 
            Match details: ${formatObject(req.query)}`;
            const response = await AIService.generateText(prompt);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching response from AI:', error);
            res.status(500).json({ error: 'Error fetching response from AI' });
        }
    },
};
