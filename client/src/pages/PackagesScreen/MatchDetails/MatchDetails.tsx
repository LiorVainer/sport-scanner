import React from 'react';
import { Tag, Typography } from 'antd';
import { EnvironmentOutlined, TrophyOutlined } from '@ant-design/icons';
import MatchHeader from '../MatchHeader/MatchHeader';
import styles from './match-details.module.scss';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface MatchDetailsProps {
    from: string;
    to: string;
    location: string;
    homeTeamImage: string;
    awayTeamImage: string;
    match: string;
    stadium: string;
    league: string;
    date: string;
    flightPrice: number;
    matchesPrice: string;
}

const MatchDetails = ({
    from,
    to,
    location,
    homeTeamImage,
    awayTeamImage,
    match,
    stadium,
    league,
    date,
    flightPrice,
    matchesPrice
}: MatchDetailsProps) => {
    return (
        <div className={styles.matchDetailsWrapper}>
            <MatchHeader from={from} to={to} location={location} />
            <div className={styles.divider} />
            <div className={styles.matchDetailsCard}>
                <img src={homeTeamImage} alt={homeTeamImage} className={styles.image} />
                <img src={awayTeamImage} alt={awayTeamImage} className={styles.image} />
                <div className={styles.details}>
                    <div className={styles.titleRow}>
                        <Text strong className={styles.matchTitle}>{match}</Text>
                        <Text className={styles.matchDate}>{formattedDate(date)}</Text>
                    </div>
                    <div className={styles.meta}>
                        <Tag icon={<EnvironmentOutlined />} className={styles.stadiumTag}>{stadium}</Tag>
                        <Tag icon={<TrophyOutlined />} className={styles.leagueTag}>{league}</Tag>
                    </div>
                    <div className={styles.prices}>
                        <Text className={styles.priceRange}>
                            <img src="../public/flight.png" alt="stadium" className={styles.icon} />
                            {flightPrice}
                        </Text>
                        <Text className={styles.priceRange}>
                            <img src="../public/stadium.png" alt="stadium" className={styles.icon} />
                            {matchesPrice}
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default MatchDetails;
