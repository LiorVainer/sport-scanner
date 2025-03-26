import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import classes from './match-experience-actions.module.scss';
import { ShareMatchExperienceModal } from '@components/ShareMatchExperienceModal';
import { MatchExperience } from '@/models/match-experience.model.ts';
import { DeleteMatchExperienceModal } from '@components/DeleteMatchExperienceModal';
import { useAuth } from '../../context/AuthContext';

interface MatchExperienceActionsProps {
    matchExperienceId: string;
    likes: string[];
    isCreator: boolean;
    liveChat: {
        isOpen: boolean;
        onClick: () => void;
    };
}

export const MatchExperienceActions = ({
    matchExperienceId,
    liveChat,
    likes,
    isCreator,
}: MatchExperienceActionsProps) => {
    const queryClient = useQueryClient();
    const [isEditMatchExperienceModalOpen, setIsEditMatchExperienceModalOpen] = useState(false);
    const [deleteMatchExperienceModalOpen, setDeleteMatchExperienceModalOpen] = useState(false);
    const { loggedInUser } = useAuth();

    if (!loggedInUser) return null;

    const currentUserId = loggedInUser._id;

    const { mutate: likeMutate, isPending: isLikePending } = useMutation({
        mutationFn: () => MatchExperienceService.likeMatchExperience(matchExperienceId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId] }),
    });

    const { data: matchExperience } = useQuery<MatchExperience>({
        queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId],
    });

    if (!matchExperience) return null;

    const { mutate: unlikeMutate, isPending: isUnlikePending } = useMutation({
        mutationFn: () => MatchExperienceService.unlikeMatchExperience(matchExperienceId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId] }),
    });

    const onLikePress = () => {
        likeMutate();
    };

    const onUnlikePress = () => {
        unlikeMutate();
    };

    const isLiked = useMemo(() => likes.includes(currentUserId), [likes, currentUserId]);

    const isLikedDisabled = useMemo(() => {
        if (isCreator) {
            return true;
        }
        return isLiked ? isLikePending : isUnlikePending;
    }, [isCreator, isLiked, isLikePending, isUnlikePending]);

    return (
        <div className={classes.actions}>
            {isCreator ? (
                <>
                    <button className={classes.deleteButton} onClick={() => setDeleteMatchExperienceModalOpen(true)}>
                        <Trash2 size={15} />
                        <span>Delete</span>
                    </button>
                    <button className={classes.editButton} onClick={() => setIsEditMatchExperienceModalOpen(true)}>
                        <Pencil size={15} />
                        <span>Edit</span>
                    </button>
                </>
            ) : (
                <>
                    <button
                        className={clsx(
                            classes.likeButton,
                            {
                                [classes.disabled]: isLikePending,
                            },
                            isLiked ? classes.liked : classes.unliked
                        )}
                        onClick={isLiked ? onUnlikePress : onLikePress}
                        disabled={isLikedDisabled}
                    >
                        <Heart size={15} />
                        <span>{likes.length}</span>
                    </button>
                    <button
                        className={clsx(classes.liveChatButton, {
                            [classes.active]: liveChat.isOpen,
                        })}
                        onClick={liveChat.onClick}
                    >
                        <MessageCircle size={15} />
                        <span>Live Chat</span>
                    </button>
                </>
            )}

            {deleteMatchExperienceModalOpen && (
                <DeleteMatchExperienceModal
                    onClose={() => setDeleteMatchExperienceModalOpen(false)}
                    matchExperienceId={matchExperienceId}
                />
            )}

            {isEditMatchExperienceModalOpen && (
                <ShareMatchExperienceModal
                    onClose={() => {
                        setIsEditMatchExperienceModalOpen(false);
                    }}
                    existingMatchExperience={matchExperience}
                />
            )}
        </div>
    );
};
