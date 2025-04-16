import styles from './match-card.module.scss';
import { Match } from '@/models/packages/package.model.ts';
import { MatchDetails } from './MatchDetails';

interface MatchCardProps {
    match: Match;
    itemIndex: number;
}

export const MatchCard = ({ match, itemIndex }: MatchCardProps) => {
    return (
        <div className={styles.matchCardContainer}>
            {/*<MatchLabel label={`Match ${romanize(itemIndex + 1)}`} />*/}
            <MatchDetails match={match} />
        </div>
    );
};
