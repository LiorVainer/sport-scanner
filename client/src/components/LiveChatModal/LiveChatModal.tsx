import classes from './live-chat-modal.module.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import clsx from 'clsx';
import { Input } from 'antd';
import { useChat } from '@hooks/useChat.hooks.ts';
import moment from 'moment';
import { ChatMessage } from '@/models/chat.model.ts';
import { formatMessageDate } from '@/utils/date.utils.ts';
import { useAuth } from '../../context/AuthContext';
import { getPictureSrcUrl } from '../../utils/picture.utils';

export interface LiveChatModalProps {
    matchExperienceId: string;
    visitorId: string;
    creatorId: string;
    onClose: () => void;
}

export const LiveChatModal = ({ matchExperienceId, visitorId, creatorId, onClose }: LiveChatModalProps) => {
    const [newMessage, setNewMessage] = useState('');
    const { loggedInUser } = useAuth();
    if (!loggedInUser) return null;

    const loggedInUserId = loggedInUser?._id;
    const { messages, sendMessage, visitor, matchExperienceCreator, onlineUsers } = useChat({
        matchExperienceId,
        visitorId,
        loggedInUserId,
        matchExperienceCreatorId: creatorId,
    });

    const isOtherUserOnline = useMemo(
        () => (loggedInUserId === visitorId ? onlineUsers[creatorId] : onlineUsers[visitorId]),
        [onlineUsers, loggedInUserId, visitorId, creatorId]
    );

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    const shouldShowDateSeparator = useCallback(
        (index: number) => {
            if (index === 0) return true;
            const currentDate = formatMessageDate(messages?.at(index)?.createdAt);
            const previousDate = formatMessageDate(messages?.at(index - 1)?.createdAt);
            return currentDate !== previousDate;
        },
        [messages]
    );

    const renderMessage = useCallback(
        (msg: ChatMessage, index: number) => {
            const showDateSeparator = shouldShowDateSeparator(index);
            return (
                <div key={index}>
                    {showDateSeparator && (
                        <div className={classes.dateSeparator}>{formatMessageDate(msg.createdAt)}</div>
                    )}
                    <div
                        className={clsx(classes.message, {
                            [classes.ownMessage]: msg.senderId === loggedInUserId,
                        })}
                    >
                        <p>{msg.content}</p>
                        <span className={classes.timestamp}>{moment(msg.createdAt).format('hh:mm')}</span>
                    </div>
                </div>
            );
        },
        [visitorId, shouldShowDateSeparator]
    );

    return (
        <div className={classes.chatModal}>
            <div className={classes.chatHeader}>
                <div className={classes.userInfo}>
                    <img
                        src={
                            visitorId === loggedInUserId && matchExperienceCreator
                                ? getPictureSrcUrl(matchExperienceCreator?.picture)
                                : visitor && getPictureSrcUrl(visitor?.picture)
                        }
                        alt="User"
                        className={classes.userAvatar}
                    />
                    <div className={classes.userDetails}>
                        <h3>{visitorId === loggedInUserId ? matchExperienceCreator?.username : visitor?.username}</h3>
                        {isOtherUserOnline ? <p className={classes.activeStatus}>Active now</p> : null}
                    </div>
                    {isOtherUserOnline && <span className={classes.onlineDot}></span>}
                </div>
                <button onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className={classes.chatMessages}>
                {messages?.map(renderMessage)}
                <div ref={messagesEndRef} className={classes.scrollAnchor} />
            </div>

            <div className={classes.chatForm}>
                <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={classes.chatInput}
                    onPressEnter={handleSendMessage}
                />
                <button onClick={handleSendMessage} className={classes.sendButton}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};
