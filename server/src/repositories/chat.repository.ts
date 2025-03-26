import mongoose, { Document, Schema } from 'mongoose';
import { Chat, ChatMessage } from '../models/chat.model';

const ChatMessageSchema = new Schema<ChatMessage>({
    senderId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const ChatMongoSchema = new Schema<Chat>(
    {
        matchExperienceId: { type: Schema.Types.ObjectId, ref: 'MatchExperiences', required: true },
        matchExperienceCreatorId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        visitorId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        messages: [ChatMessageSchema],
    },
    { timestamps: true }
);

export const ChatRepository = mongoose.model<Chat>('Chats', ChatMongoSchema);
export type ChatDocument = Document<unknown, {}, Chat> &
    Chat &
    Required<{
        _id: string;
    }> & {
        __v: number;
    };
