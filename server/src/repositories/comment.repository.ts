import mongoose, { Document, Schema } from 'mongoose';
import { Comment } from '../models/comment.model';

const CommentMongoSchema = new Schema(
    {
        matchExperienceId: { type: Schema.Types.ObjectId, ref: 'MatchExperiences', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        content: { type: String, required: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export const CommentRepository = mongoose.model<Comment>('Comments', CommentMongoSchema);
export type CommentDocument = Document<unknown, {}, Comment> &
    Comment &
    Required<{
        _id: string;
    }> & {
        __v: number;
    };
