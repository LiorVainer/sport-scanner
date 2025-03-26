import { useParams } from 'react-router';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import classes from './match-experience-details-screen.module.scss';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@components/Screen';
import { LiveChatModal } from '@components/LiveChatModal';
import { Alert } from 'antd';
import moment from 'moment';
import { MatchDetails } from '@components/MatchDetails';
import { UserInfo } from '@components/UserInfo';
import { CommentsSection } from '@components/CommentsSection';
import { MatchExperienceActions } from '@components/MatchExperienceActions';
import { LiveChatsSection } from '@components/LiveChatsSection';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';
import { XCircle } from 'lucide-react';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { LoadingContainer } from '@components/LoadingContainer';
import { useAuth } from '@/context/AuthContext.tsx';

export interface MatchExperienceDetailsScreenProps {}

export const MatchExperienceDetailsScreen = (_props: MatchExperienceDetailsScreenProps) => {
    const { id: matchExperienceId } = useParams();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<{ visitorId: string } | null>(null);
    const { loggedInUser } = useAuth();
    const {
        data: matchExperience,
        isLoading,
        error,
    } = useQuery({
        queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId],
        queryFn: () => MatchExperienceService.getMatchExperienceById(matchExperienceId!),
        enabled: !!matchExperienceId,
    });

    const isCreator = useMemo(() => matchExperience?.user._id === loggedInUser?._id, [matchExperience, loggedInUser]);

    const openChat = (visitorId: string) => {
        setSelectedChat({ visitorId });
        setIsChatOpen(true);
    };

    if (isLoading) {
        return <LoadingContainer loadingText={'Fetching match experience...'} />;
    }

    if (error && !matchExperience) {
        return (
            <Screen className={classes.errorContainer}>
                <XCircle size={50} className={classes.errorIcon} />
                <Alert
                    message="Failed to load match experience"
                    description="There was an error fetching the details. Please try again later."
                    type="error"
                    showIcon
                />
            </Screen>
        );
    }

    if (!matchExperienceId) return null;
    if (!matchExperience) return null;
    if (!loggedInUser) return null;

    return (
        <Screen className={classes.container}>
            <div className={classes.card}>
                <div className={classes.content}>
                    {matchExperience?.picture && (
                        <img
                            src={getPictureSrcUrl(matchExperience.picture)}
                            alt={matchExperience.title}
                            className={classes.image}
                        />
                    )}
                    <div className={classes.header}>
                        <div className={classes.headerLeft}>
                            <MatchDetails matchExperience={matchExperience} />
                            <MatchExperienceActions
                                matchExperienceId={matchExperienceId}
                                likes={matchExperience.likes}
                                isCreator={isCreator}
                                liveChat={{
                                    isOpen: isChatOpen,
                                    onClick: () => openChat(loggedInUser?._id),
                                }}
                            />
                        </div>
                        <div className={classes.headerRight}>
                            <div className={classes.experienceContent}>
                                <div className={classes.topRow}>
                                    <p className={classes.title}>{matchExperience.title}</p>
                                    <div className={classes.timeContainer}>
                                        <p className={classes.contentTime}>
                                            posted {moment(matchExperience.createdAt).fromNow()}
                                        </p>
                                    </div>
                                </div>
                                <p className={classes.description}>{matchExperience.description}</p>
                            </div>
                            <UserInfo user={matchExperience.user} />
                        </div>
                    </div>
                </div>

                {isChatOpen && selectedChat && (
                    <LiveChatModal
                        onClose={() => setIsChatOpen(false)}
                        matchExperienceId={matchExperienceId}
                        creatorId={matchExperience.user._id}
                        visitorId={selectedChat.visitorId}
                    />
                )}
            </div>

            <CommentsSection matchExperienceId={matchExperienceId} />

            {isCreator && <LiveChatsSection matchExperienceId={matchExperienceId} onChatClick={openChat} />}
        </Screen>
    );
};
