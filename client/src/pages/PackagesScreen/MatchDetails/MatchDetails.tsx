import { Tag, Typography } from 'antd';
import { EnvironmentOutlined, TrophyOutlined } from '@ant-design/icons';
import styles from './match-details.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { Match, Package } from '@/models/packages/package.model.ts';
import { MatchHeader } from '../MatchHeader/MatchHeader';
// import { TicketsPlane } from 'lucide-react';

const { Text } = Typography;

interface MatchDetailsProps {
    match: Match;
    singlePackage: Package;
    showHeader?: boolean;
    matchIndex: number;
}

export const MatchDetails = ({ match, singlePackage, matchIndex, showHeader = true }: MatchDetailsProps) => {
    const { homeTeam, awayTeam, stadium, league, date, price } = match;
    const { fromDate, toDate, location } = singlePackage;

    const departureDate = flights[matchIndex]?.departureDate || fromDate;
    const returnDate = flights[matchIndex + 1]?.departureDate || toDate;
    const splitLocation = location.split('&')[matchIndex] || location;

    return (
        <div className={styles.matchDetailsWrapper}>
            {showHeader && <MatchHeader startDate={departureDate} endDate={returnDate} location={splitLocation} />}
            <div className={styles.divider} />
            <div className={styles.matchDetailsCard}>
                <div className={styles.matchTeamsLogos}>
                    <img src={homeTeam.logo} alt={homeTeam.name} className={styles.image} />
                    <span className={styles.vs}>VS</span>
                    <img src={awayTeam.logo} alt={awayTeam.name} className={styles.image} />
                </div>
                <div className={styles.details}>
                    <div className={styles.titleRow}>
                        <Text strong className={styles.matchTitle}>
                            {`${homeTeam.name} VS ${awayTeam.name}`}
                        </Text>
                        <Text className={styles.matchDate}>{formattedDate(date)}</Text>
                    </div>
                    <div className={styles.meta}>
                        <Tag icon={<EnvironmentOutlined />} className={styles.stadiumTag}>
                            {stadium}
                        </Tag>
                        <Tag icon={<TrophyOutlined />} className={styles.leagueTag}>
                            {league}
                        </Tag>
                    </div>
                    <div className={styles.prices}>
                        {
                            // TODO: Think of better way to show prices
                            /* <Text className={styles.priceRange}>
                            <TicketsPlane className={styles.icon} />
                            {flightsPrice}$
                        </Text> */
                        }
                        <Text className={styles.priceRange}>
                            <img src="/stadium.svg" alt="stadium" className={styles.icon} />
                            {`${price.min}$ - ${price.max}$`}
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};
