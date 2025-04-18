import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './fixtures-details.module.scss';
import { FixturesToFlattenedDetails } from '@/utils/fixture.utils.ts';
import moment from 'moment';
import { ExtendedFixtureItem } from '@/models/soccer/fixture.model';

interface FixtureDetailsProps {
    fixtures: ExtendedFixtureItem[];
}

export const FixturesDetails = ({ fixtures }: FixtureDetailsProps) => {
    if (!fixtures || fixtures.length === 0) {
        return null;
    }

    return (
        <div className={styles.infoBlock}>
            <div className={styles.fixtureList}>
                {FixturesToFlattenedDetails(fixtures).map(({ homeTeam, awayTeam, date, price, league }) => (
                    <div className={styles.fixtureItem} key={date}>
                        <div className={styles.league}>
                            <img src={league.logo} alt={league.name} className={styles.leagueLogo} />
                            <p>{league.name}</p>
                        </div>
                        <div className={styles.fixtureTeams}>
                            <div className={styles.teamDetails}>
                                <p className={styles.teamName}>{homeTeam.name}</p>
                                <img src={homeTeam.logo} alt={homeTeam.name} className={styles.teamLogo} />
                            </div>
                            <span className={styles.vs}>VS</span>
                            <div className={styles.teamDetails}>
                                <img src={awayTeam.logo} alt={awayTeam.name} className={styles.teamLogo} />
                                <p className={styles.teamName}>{awayTeam.name}</p>
                            </div>
                        </div>
                        <div className={styles.metadata}>
                            {price ? (
                                <p className={styles.fixturePrice}>
                                    <span>{`${price?.min}$`}</span>
                                    <ArrowRightOutlined />
                                    <span>{`${price?.max}$`}</span>
                                </p>
                            ) : (
                                <p className={styles.fixtureDate}>{moment(new Date(date)).format('DD/MM')}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
