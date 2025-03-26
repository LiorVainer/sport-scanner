import classes from './live-chats-section.module.scss';
import moment from 'moment/moment';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { ChatService } from '@api/services/chat.service.ts';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';

export interface LiveChatsSectionProps {
    matchExperienceId: string;
    onChatClick: (visitorId: string) => void;
}

export const LiveChatsSection = ({ matchExperienceId, onChatClick }: LiveChatsSectionProps) => {
    const { data: liveChats } = useQuery({
        queryKey: [QUERY_KEYS.CHATS, matchExperienceId],
        queryFn: () => ChatService.getChatsForMatchExperience(matchExperienceId),
    });

    //TODO make sure actual image is displayed

    return liveChats && liveChats.length > 0 ? (
        <div className={classes.liveChatsSection}>
            <h4>Live Chats</h4>
            <div className={classes.liveChatsList}>
                {liveChats.map((chat) => (
                    <div key={chat._id} className={classes.chatItem} onClick={() => onChatClick(chat.visitor._id)}>
                        <div className={classes.chatInfo}>
                            <div className={classes.chatUserInfo}>
                                <img className={classes.chatUserInage} src={getPictureSrcUrl(chat.visitor.picture)} />
                                <p className={classes.chatUser}>{chat.visitor.username}</p>
                            </div>
                            <div className={classes.chatTimestamps}>
                                <span className={classes.chatUpdatedAt}>
                                    Last Update: {moment(chat.updatedAt).fromNow()}
                                </span>
                                <span className={classes.chatCreatedAt}>
                                    Created: {moment(chat.createdAt).format('MMM D, YYYY hh:mm')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : null;
};
