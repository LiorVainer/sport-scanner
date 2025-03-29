import React from 'react';
import { Typography, Button, Tag } from 'antd';
import { TrophyOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from './scss/match-details.module.scss';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface MatchDetailsProps {
    homeTeamImage: string;
    awayTeamImage: string;
    homeTeam: string;
    awayTeam: string;
    stadium: string;
    league: string;
    matchDate: string;
    price: number;
    linkForTicket: string;
}

const MatchDetails = ({ homeTeamImage,awayTeamImage, homeTeam, awayTeam, stadium, league, matchDate, price,linkForTicket }: MatchDetailsProps) => {
    return (
        <div className={styles['match-details-container']}>
            <img src={homeTeamImage} alt={homeTeam} className={styles['match-image']} />
            <img src={awayTeamImage} alt={awayTeam} className={styles['match-image']} />
            <div className={styles['match-info']}>
                <Text strong className={styles['match-teams']}>
                    {`${homeTeam} VS ${awayTeam}`}
                </Text>
                <div className={styles['match-meta']}>
                    <Tag icon={<EnvironmentOutlined />} className={styles['stadium-tag']}>
                        {stadium}
                    </Tag>
                    <Tag icon={<TrophyOutlined />} className={styles['league-tag']}>
                        {league}
                    </Tag>
                </div>
            </div>
            <div className={styles['match-date-price']}>
                <div className={styles['match-day-container']}>
                    <Text className={styles['match-date']}>
                        {formattedDate(matchDate)}
                    </Text>
                    <Text className={styles['match-day']}>
                        <img src="../public/stadium.png" alt="stadium" className={styles['stadium-icon']} />
                        Match Day
                    </Text>
                </div>
                <div className={styles['match-price-info']}>
                    <div className={styles['price-container']}>
                        <Text className={styles['price-text']}>from</Text>
                        <Text strong className={styles['price-amount']}>{price}$</Text>
                    </div>
                    <a href={linkForTicket} target="_blank" rel="noopener noreferrer">
                    <Button type="primary" className={styles['match-ticket-button']}>
                        Match Tickets
                    </Button>
                </a>
                </div>
            </div>
        </div>
    );
};

export default MatchDetails;
