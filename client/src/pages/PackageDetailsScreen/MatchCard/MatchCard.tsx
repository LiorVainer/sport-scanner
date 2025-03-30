import styles from './match-card.module.scss';
import { Match, Package } from '@/models/package.model';
import { romanize } from 'romans';
import { MatchLabel } from './MatchLabel';
import { MatchDetails } from './MatchDetails';

interface MatchCardProps {
    match: Match;
    singlePackage: Package;
    itemIndex: number;
}

export const MatchCard = ({ match, singlePackage, itemIndex }: MatchCardProps) => {
    const {
        homeTeam: { logo: homeTeamImage, name: homeTeam },
        awayTeam: { logo: awayTeamImage, name: awayTeam },
        stadium,
        league,
        date: matchDate,
        price: { min: minPrice },
        searchMatchTicketsLink,
    } = match;
    const { fromDate, toDate, location } = singlePackage;

    const splitLocation = location.split('&')[itemIndex] || location;

    return (
        <div className={styles.matchCardContainer}>
            <MatchLabel
                label={`Match ${romanize(itemIndex + 1)}`}
                location={splitLocation}
                from={fromDate}
                to={toDate}
            />
            <MatchDetails
                homeTeamImage={homeTeamImage}
                awayTeamImage={awayTeamImage}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                stadium={stadium}
                league={league}
                matchDate={matchDate}
                price={minPrice}
                linkForTicket={searchMatchTicketsLink}
            />
        </div>
    );
};
