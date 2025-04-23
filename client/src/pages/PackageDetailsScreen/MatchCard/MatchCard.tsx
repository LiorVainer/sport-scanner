import styles from './match-card.module.scss';
import { Match } from '@/models/packages/package.model.ts';
import { MatchDetails } from './MatchDetails';

interface MatchCardProps {
    match: Match;
}

export const MatchCard = ({ match }: MatchCardProps) => {
    return (
        <div className={styles.matchCardContainer}>
            <MatchDetails match={match} />
        </div>
    );
};
