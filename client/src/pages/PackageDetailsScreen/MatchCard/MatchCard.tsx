import React from 'react';
import MatchLabel from './MatchLabel';
import MatchDetails from './MatchDetails';
import styles from './scss/match-card.module.scss';

interface MatchCardProps {
    label: string;
    homeTeam: string;
    awayTeam: string;
    location: string;
    from: string;
    to: string;
    matchDate: string;
    homeTeamImage: string;
    awayTeamImage: string;
    stadium: string;
    league: string;
    price: number;
    linkForTicket: string;
}

const MatchCard = ({
    label,
    location,
    from,
    to,
    homeTeamImage,
    awayTeamImage,
    homeTeam,
    awayTeam,
    stadium,
    league,
    matchDate,
    price,
    linkForTicket
}: MatchCardProps) => (
    <div className={styles['match-card-container']}>
        <MatchLabel label={label} location={location} from={from} to={to} />
        <MatchDetails
            homeTeamImage={homeTeamImage}
            awayTeamImage={awayTeamImage}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            stadium={stadium}
            league={league}
            matchDate={matchDate}
            price={price}
            linkForTicket={linkForTicket}
        />
    </div>
);

export default MatchCard;
