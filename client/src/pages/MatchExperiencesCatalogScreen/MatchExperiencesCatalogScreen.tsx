import { ShareMatchExperienceModal } from '@components/ShareMatchExperienceModal';
import classes from './match-experiences-catalog-screen.module.scss';
import { PlusOutlined } from '@ant-design/icons';
import { FaFutbol } from 'react-icons/fa';
import { Button, Select, Spin } from 'antd';

import { useState } from 'react';
import { MatchExperienceService } from '@/api/services/match-experience.service';
import { MatchDetails } from '@components/MatchDetails';
import { Screen } from '@components/Screen';
import { useQuery } from '@tanstack/react-query';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';
import moment from 'moment';
import { Heart, MessageCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from 'react-router-dom';
import { QUERY_KEYS } from '@/api/constants/query-keys.const';
import { useAuth } from '@/context/AuthContext';

export interface MatchExperiencesCatalogScreenProps {
    mode: 'all' | 'my';
}

const PageItemsLimit = 6;

export const MatchExperiencesCatalogScreen = ({ mode }: MatchExperiencesCatalogScreenProps) => {
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('date');
    const { loggedInUser } = useAuth();

    const navigate = useNavigate();

    const {
        data: matchExperiencesData,
        error: matchExperiencesError,
        isPending: matchExperiencesIsPending,
        refetch,
    } = useQuery({
        queryKey:
            mode === 'all'
                ? [QUERY_KEYS.MATCH_EXPERIENCES, page, sortBy]
                : [QUERY_KEYS.USER_MATCH_EXPERIENCES, page, sortBy, loggedInUser?._id],
        queryFn: () =>
            mode === 'all'
                ? MatchExperienceService.getAllMatchExperience(page, PageItemsLimit, sortBy)
                : MatchExperienceService.getAllMatchExperiencesByUserId(
                      loggedInUser?._id,
                      page,
                      PageItemsLimit,
                      sortBy
                  ),
    });

    const totalPages = matchExperiencesData?.totalPages || 1;
    const matchExperiences = matchExperiencesData?.experiences || [];

    const [isModalOpen, setIsModalOpen] = useState(false);

    if (matchExperiencesError) {
        console.error('Error', matchExperiencesError);
        return <div>Error has occurred</div>;
    }

    return (
        <Screen className={classes.container}>
            <div className={classes.content}>
                <div className={classes.header}>
                    <h1>{mode === 'all' ? 'Home Screen' : 'My Experiences'}</h1>

                    <Select
                        value={sortBy}
                        onChange={(value) => {
                            setSortBy(value);
                            setPage(1);
                        }}
                        className={classes.sortDropdown}
                    >
                        <Select.Option value="date">Sort by Date</Select.Option>
                        <Select.Option value="likes">Sort by Likes</Select.Option>
                    </Select>

                    {matchExperiencesIsPending ? (
                        <div className={classes.loadingContainer}>
                            <Spin />
                        </div>
                    ) : matchExperiences?.length ? (
                        <div className={classes.matchList}>
                            {matchExperiences.map((matchExperience) => (
                                <div
                                    className={classes.matchCardContainer}
                                    onClick={() => navigate(`${ROUTES.MATCH_EXPERIENCES}/${matchExperience._id}`)}
                                >
                                    {matchExperience.picture && (
                                        <img
                                            src={getPictureSrcUrl(matchExperience.picture)}
                                            alt={matchExperience.title}
                                            className={classes.image}
                                        />
                                    )}
                                    <div className={classes.matchCardDetails} key={matchExperience._id}>
                                        <div className={classes.test}>
                                            <MatchDetails matchExperience={matchExperience} />
                                            <div className={classes.rightSide}>
                                                <p className={classes.contentTime}>
                                                    posted {moment(matchExperience.createdAt).fromNow()}
                                                </p>
                                                <div className={classes.userInteraction}>
                                                    <div className={classes.likes}>
                                                        <div>{matchExperience.likes.length} likes</div>
                                                        <Heart size={15} />
                                                    </div>
                                                    <div className={classes.comments}>
                                                        <div>{matchExperience.comments.length} comments</div>
                                                        <MessageCircle size={15} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={classes.noMatchExperiences}>No Match Experiences were Found</div>
                    )}
                </div>
                <div className={classes.pagination}>
                    <Button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={classes.pageButton}
                    >
                        Previous
                    </Button>
                    <span>
                        Page {page} of {totalPages}{' '}
                    </span>
                    <Button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className={classes.pageButton}
                    >
                        Next
                    </Button>
                </div>

                <button className={classes.floatingButton} onClick={() => setIsModalOpen(true)}>
                    <FaFutbol className={classes.icon} />
                    <div className={classes.plusIcon}>
                        <PlusOutlined />
                    </div>
                </button>
                {isModalOpen && (
                    <ShareMatchExperienceModal
                        onClose={() => {
                            setIsModalOpen(false);
                            refetch();
                        }}
                    />
                )}
            </div>
        </Screen>
    );
};
