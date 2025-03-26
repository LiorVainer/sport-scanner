import { z } from 'zod';
import { zodDate } from '@/utils/zod.utils.ts';
import { PublicUserSchema } from '@/models/user.model.ts';

export const ChatMessageSchema = z.object({
    senderId: z.string(),
    content: z.string(),
    createdAt: zodDate,
});

export const ChatSchema = z.object({
    _id: z.string(),
    matchExperienceId: z.string(),
    matchExperienceCreatorId: z.string(),
    matchExperienceCreator: PublicUserSchema.pick({ username: true, picture: true, _id: true }),
    visitorId: z.string(),
    visitor: PublicUserSchema.pick({ username: true, picture: true, _id: true }),
    messages: z.array(ChatMessageSchema),
    createdAt: zodDate,
    updatedAt: zodDate,
});

export const GetChatQueryParamsSchema = ChatSchema.pick({
    matchExperienceId: true,
    matchExperienceCreatorId: true,
    visitorId: true,
});

export const SendMessagePayloadSchema = z.object({
    matchExperienceId: ChatSchema.shape.matchExperienceId,
    senderId: z.string(),
    visitorId: z.string(),
    content: ChatMessageSchema.shape.content,
});

export type SendMessagePayload = z.infer<typeof SendMessagePayloadSchema>;
export type GetChatQueryParams = z.infer<typeof GetChatQueryParamsSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
