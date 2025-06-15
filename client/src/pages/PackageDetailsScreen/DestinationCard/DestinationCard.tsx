import { Destination } from '@/models/packages/package.model';
import styles from './destination-card.module.scss';
import { MatchCard } from '@pages/PackageDetailsScreen/MatchCard';
import { Calendar } from 'lucide-react';
import { formattedDate } from '@/utils/date.utils.ts';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { Text } = Typography;

interface DestinationCardProps {
    destination: Destination;
}

export const DestinationCard = ({ destination }: DestinationCardProps) => (
    <div className={styles.destinationCard}>
        <div className={styles.header}>
            <div className={styles.left}>
                <div className={styles.city}>
                    <FontAwesomeIcon icon={faLocationDot} />
                    {destination.city}
                </div>
                <Text className={styles.destinationDates}>
                    <Calendar className={styles.calendarIcon} />
                    {formattedDate(destination.startDate)} <ArrowRightOutlined className={styles.arrowIcon} />
                    {formattedDate(destination.endDate)}
                </Text>
            </div>
            <div className={styles.destinationMatches}>
                <p>{destination.matches.length} Matches</p>
            </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.matchesSection}>
            {destination.matches.map((match) => (
                <MatchCard match={match} />
            ))}
        </div>
    </div>
);
