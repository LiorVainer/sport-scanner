import { CoreSystemMessage, CoreUserMessage } from 'ai';

export const system = (content: string): CoreSystemMessage => ({
    role: 'system',
    content,
});

export const user = (content: string): CoreUserMessage => ({
    role: 'user',
    content,
});

export const message = {
    system,
    user,
};
