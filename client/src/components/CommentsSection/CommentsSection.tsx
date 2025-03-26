import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { MatchExperience } from '@/models/match-experience.model';
import { Input, Spin } from 'antd';
import classes from './comments-section.module.scss';
import moment from 'moment';
import { useState } from 'react';
import { MatchExperienceService } from '@api/services/match-experience.service.ts';
import clsx from 'clsx';
import { Loader, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPictureSrcUrl } from '../../utils/picture.utils';

export interface CommentsSectionProps {
    matchExperienceId: string;
}

export const CommentsSection = ({ matchExperienceId }: CommentsSectionProps) => {
    const {
        data: matchExperience,
        isLoading,
        error,
    } = useQuery<MatchExperience>({
        queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId],
    });

    const { loggedInUser } = useAuth();

    if (isLoading) {
        return <Spin />;
    }

    if (error || !matchExperience) {
        return <div>Error loading comments</div>;
    }
    if (!loggedInUser) return null;

    return (
        <div className={classes.commentsSection}>
            <h3 className={classes.commentsTitle}>Comments</h3>

            <div className={classes.commentsList}>
                {matchExperience.comments.map((comment) => (
                    <div key={comment._id} className={classes.commentItem}>
                        <img
                            className={classes.commentAvatar}
                            src={getPictureSrcUrl(comment.user.picture)}
                            alt={'image'}
                        />
                        <div className={classes.commentContent}>
                            <div className={classes.commentHeader}>
                                <p className={classes.commentUser}>{comment.user.username}</p>
                                <time>{moment(comment.createdAt).fromNow()}</time>
                            </div>

                            <div className={classes.commentFooter}>
                                <p>{comment.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <NewCommentInput matchExperienceId={matchExperience._id} />
        </div>
    );
};

interface NewCommentInputProps {
    matchExperienceId: string;
}

const NewCommentInput = ({ matchExperienceId }: NewCommentInputProps) => {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const { loggedInUser } = useAuth();

    if (!loggedInUser) return null;

    const commentMutation = useMutation({
        mutationFn: (comment: string) => MatchExperienceService.addComment(matchExperienceId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE, matchExperienceId] });
            setNewComment('');
        },
    });

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        commentMutation.mutate(newComment);
    };

    return (
        <div onSubmit={handleAddComment} className={classes.commentForm}>
            <img className={classes.commentAvatar} src={getPictureSrcUrl(loggedInUser.picture)} />
            <Input
                value={newComment}
                onChange={(e: any) => setNewComment(e.target.value)}
                onPressEnter={handleAddComment}
                placeholder="Add a comment..."
                disabled={commentMutation.isPending}
            />
            <button
                className={clsx(classes.sendCommentButton, {
                    [classes.loading]: commentMutation.isPending,
                })}
                disabled={commentMutation.isPending}
                onClick={handleAddComment}
            >
                {commentMutation.isPending ? <Loader size={16} className={classes.spinner} /> : <Send size={16} />}
            </button>
        </div>
    );
};
