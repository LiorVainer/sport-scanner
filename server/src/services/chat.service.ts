import { ChatRepository } from '../repositories/chat.repository';

class ChatService {
    async getChatBetweenUsers(matchExperienceId: string, visitorId: string, matchExperienceCreatorId: string) {
        try {
            let chat = await this.findChatBetweenUsers(matchExperienceId, visitorId, matchExperienceCreatorId);

            if (!chat) {
                chat = new ChatRepository({
                    matchExperienceId,
                    visitorId,
                    matchExperienceCreatorId,
                    messages: [],
                });
                await chat.save();

                chat = await this.findChatBetweenUsers(matchExperienceId, visitorId, matchExperienceCreatorId);
            }

            if (!chat) {
                throw new Error('Error fetching chat');
            }

            return {
                ...chat.toObject(),
                visitor: chat.visitorId,
                matchExperienceCreator: chat.matchExperienceCreatorId,
                visitorId,
                matchExperienceCreatorId,
            };
        } catch (error) {
            throw new Error('Error fetching chat');
        }
    }

    async getChatsForMatchExperience(matchExperienceId: string) {
        try {
            const chats = await ChatRepository.find({ matchExperienceId })
                .populate('matchExperienceCreatorId', 'username picture')
                .populate('visitorId', 'username picture')
                .sort({ updatedAt: -1 });

            return chats.map((chat) => ({
                ...chat.toObject(),
                visitor: chat.visitorId,
                matchExperienceCreator: chat.matchExperienceCreatorId,
                visitorId: chat.visitorId._id,
                matchExperienceCreatorId: chat.matchExperienceCreatorId._id,
            }));
        } catch (error) {
            throw new Error('Error fetching chats for match experience');
        }
    }

    private async findChatBetweenUsers(matchExperienceId: string, visitorId: string, matchExperienceCreatorId: string) {
        return ChatRepository.findOne({
            matchExperienceId,
            visitorId,
            matchExperienceCreatorId,
        })
            .populate('matchExperienceCreatorId', 'username picture')
            .populate('visitorId', 'username picture');
    }
}

export const chatService = new ChatService();
