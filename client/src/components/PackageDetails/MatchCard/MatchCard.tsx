import React from 'react';
import MatchLabel from './MatchLabel';
import MatchDetails from './MatchDetails';
import styles from './scss/match-card.module.scss';

interface MatchCardProps {
    label: string;
    homeTeam: string;
    awayTeam: string;
    location: string;
    departureDate: string;
    matchDate: string;
    imagePath: string;
    stadium: string;
    league: string;
    price: number;
}

const MatchCard = ({
    label,
    location,
    departureDate,
    imagePath,
    homeTeam,
    awayTeam,
    stadium,
    league,
    matchDate,
    price,
}: MatchCardProps) => (
    <div className={styles['match-card-container']}>
        <MatchLabel label={label} location={location} departureDate={departureDate} matchDate={matchDate} />
        <MatchDetails
            image={imagePath}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            stadium={stadium}
            league={league}
            matchDate={matchDate}
            price={price}
        />
    </div>
);

export default MatchCard;
