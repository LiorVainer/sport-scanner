import { Tag, Typography } from 'antd';
import { EnvironmentOutlined, ExportOutlined } from '@ant-design/icons';
import styles from './match-details.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { Match } from '@/models/packages/package.model.ts';

const { Text } = Typography;

interface MatchDetailsProps {
    match: Match;
}

export const MatchDetails = ({ match }: MatchDetailsProps) => {
    const {
        homeTeam: { logo: homeTeamImage, name: homeTeam },
        awayTeam: { logo: awayTeamImage, name: awayTeam },
        stadium,
        league,
        date: matchDate,
        price: { min: minPrice },
        searchMatchTicketsLink,
    } = match;

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
                            {stadium.name}
                        </Tag>
                        <div className={styles.leagueTag}>
                            <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
                            <p>{league.name}</p>
                        </div>
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
                        <Text className={styles.priceText}>from</Text>
                        <Text strong className={styles.priceAmount}>
                            {minPrice}$
                        </Text>
                    </div>
                    <a href={searchMatchTicketsLink} target="_blank" rel="noopener noreferrer">
                        <button className={styles.matchTicketButton}>
                            <ExportOutlined />
                            Match Tickets
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
};
