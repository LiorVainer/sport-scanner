import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Chat, ChatMessage, ChatMessageSchema, GetChatQueryParams, SendMessagePayload } from '@/models/chat.model.ts';
import { ChatService } from '@api/services/chat.service.ts';
import { SERVER_URL } from '@api/config/axios-instance.ts';
import { SOCKET_EVENTS } from '@/constants/socket.const.ts';

export type UseChatProps = GetChatQueryParams & {
    loggedInUserId: string;
};

export const useChat = ({ loggedInUserId, ...chatParams }: UseChatProps) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(SERVER_URL, {
                transports: ['websocket'],
            });

            ChatService.getChat(chatParams).then((chat) => chat && setChat(chat));
        }

        socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, { ...chatParams, loggedInUserId });

        socketRef.current.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message: ChatMessage) => {
            const parsed = ChatMessageSchema.safeParse(message);

            if (!parsed.success) {
                console.error('Invalid message received:', parsed.error);
                return;
            }

            setChat((prevChat) => {
                if (!prevChat) return null;
                return {
                    ...prevChat,
                    messages: [...prevChat.messages, message],
                };
            });
        });

        socketRef.current.on(SOCKET_EVENTS.USER_CONNECTED, ({ userId }) => {
            setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
        });

        socketRef.current.on(SOCKET_EVENTS.USER_DISCONNECTED, ({ userId }) => {
            setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatParams.visitorId]);

    const sendMessage = (content: string) => {
        const { matchExperienceId } = chatParams;
        const messagePayload: SendMessagePayload = {
            matchExperienceId,
            senderId: loggedInUserId,
            visitorId: chatParams.visitorId,
            content,
        };

        if (socketRef.current) {
            socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, messagePayload);
        }
    };

    return {
        sendMessage,
        chat,
        messages: chat?.messages,
        visitor: chat?.visitor,
        matchExperienceCreator: chat?.matchExperienceCreator,
        onlineUsers,
    };
};
