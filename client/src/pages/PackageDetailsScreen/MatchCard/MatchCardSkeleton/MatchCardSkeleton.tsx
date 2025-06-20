import styles from '../match-card.module.scss';
import { MatchDetailsSkeleton } from '@pages/PackageDetailsScreen/MatchCard/MatchDetailsSkeleton';

export const MatchCardSkeleton = () => {
    return (
        <div className={styles.matchCardContainer}>
            <MatchDetailsSkeleton />
        </div>
    );
};
