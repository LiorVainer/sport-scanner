import { Typography, Button, Tag } from 'antd';
import { TrophyOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from './match-details.module.scss';
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

export const MatchDetails = ({
    homeTeamImage,
    awayTeamImage,
    homeTeam,
    awayTeam,
    stadium,
    league,
    matchDate,
    price,
    linkForTicket,
}: MatchDetailsProps) => {
    return (
        <div className={styles.matchDetailsContainer}>
            <div className={styles.matchDetails}>
                <img src={homeTeamImage} alt={homeTeam} className={styles.matchImage} />
                <div className={styles.matchInfo}>
                    <Text strong className={styles.matchTeams}>
                        {`${homeTeam} VS ${awayTeam}`}
                    </Text>
                    <div className={styles.matchMeta}>
                        <Tag icon={<EnvironmentOutlined />} className={styles.stadiumTag}>
                            {stadium}
                        </Tag>
                        <Tag icon={<TrophyOutlined />} className={styles.leagueTag}>
                            {league}
                        </Tag>
                    </div>
                </div>
                <img src={awayTeamImage} alt={awayTeam} className={styles.matchImage} />
            </div>
            <div className={styles.matchDatePrice}>
                <div className={styles.matchDayContainer}>
                    <Text className={styles.matchDate}>{formattedDate(matchDate)}</Text>
                    <Text className={styles.matchDay}>
                        <img src="/stadium.svg" alt="stadium" className={styles.stadiumIcon} />
                        Match Day
                    </Text>
                </div>
                <div className={styles.matchPriceInfo}>
                    <div className={styles.priceContainer}>
                        <Text className={styles.priceText}>from:</Text>
                        <Text strong className={styles.priceAmount}>
                            {price}$
                        </Text>
                    </div>
                    <a href={linkForTicket} target="_blank" rel="noopener noreferrer">
                        <Button type="primary" className={styles.matchTicketButton}>
                            Match Tickets
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
};
