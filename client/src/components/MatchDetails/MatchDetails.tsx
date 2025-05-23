import { Tag, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import styles from './match-details.module.scss';
import { formattedDate } from '@/utils/date.utils.ts';
import { Match } from '@/models/packages/package.model.ts';

const { Text } = Typography;

interface MatchDetailsProps {
    match: Match;
    variant?: 'full' | 'compact';
    includeDivider?: boolean;
}

export const MatchDetails = ({ match, variant = 'full', includeDivider }: MatchDetailsProps) => {
    const { homeTeam, awayTeam, stadium, league, date, price } = match;

    const isFull = variant === 'full';

    return (
        <div className={styles.matchDetailsWrapper}>
            {includeDivider && <div className={styles.divider} />}
            <div className={clsx(styles.matchDetailsCard, { [styles.compactCard]: !isFull })}>
                <div className={styles.matchTeamsLogos}>
                    <img
                        src={homeTeam.logo}
                        alt={homeTeam.name}
                        className={clsx(styles.imageBase, {
                            [styles.image]: isFull,
                            [styles.compactImage]: !isFull,
                        })}
                    />
                    <span
                        className={clsx(styles.vsBase, {
                            [styles.vs]: isFull,
                            [styles.compactVs]: !isFull,
                        })}
                    >
                        VS
                    </span>
                    <img
                        src={awayTeam.logo}
                        alt={awayTeam.name}
                        className={clsx(styles.imageBase, {
                            [styles.image]: isFull,
                            [styles.compactImage]: !isFull,
                        })}
                    />
                </div>
                {isFull ? (
                    <div className={styles.details}>
                        <div className={styles.titleRow}>
                            <Text strong className={clsx(styles.matchTitle, styles.matchTitleFull)}>
                                {`${homeTeam.name} VS ${awayTeam.name}`}
                            </Text>
                            <Text className={styles.matchDate}>{formattedDate(date)}</Text>
                        </div>
                        <div className={styles.meta}>
                            <Tag icon={<EnvironmentOutlined />} className={styles.stadiumTag}>
                                {stadium.name}
                            </Tag>
                            <div className={styles.leagueTag}>
                                <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
                                <p>{league.name}</p>
                            </div>
                        </div>
                        <div className={styles.prices}>
                            <Text className={styles.priceRange}>
                                <img src="/stadium.svg" alt="stadium" className={styles.icon} />
                                {`${price.min}$ - ${price.max}$`}
                            </Text>
                        </div>
                    </div>
                ) : (
                    <div className={styles.details}>
                        <div className={styles.titleRow}>
                            <Text strong className={clsx(styles.matchTitle, styles.matchTitleCompact)}>
                                {`${homeTeam.name} VS ${awayTeam.name}`}
                            </Text>
                            <Text className={styles.matchDate}>{formattedDate(date)}</Text>
                        </div>
                        <div className={styles.prices}>
                            <Text className={styles.priceRange}>
                                <img src="/stadium.svg" alt="stadium" className={styles.icon} />
                                {`${price.min}$ - ${price.max}$`}
                            </Text>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
