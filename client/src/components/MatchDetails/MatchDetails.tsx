import { Tag, Typography } from 'antd';
import { EnvironmentOutlined, TrophyOutlined } from '@ant-design/icons';
import styles from './match-details.module.scss';
import { formattedDate } from '@/utils/date.utils.ts';
import { Match } from '@/models/packages/package.model.ts';

const { Text } = Typography;

interface MatchDetailsProps {
    match: Match;
}

export const MatchDetails = ({ match }: MatchDetailsProps) => {
    const { homeTeam, awayTeam, stadium, league, date, price } = match;

    return (
        <div className={styles.matchDetailsWrapper}>
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
