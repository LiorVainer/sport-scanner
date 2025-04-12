import { Destination } from '@/models/packages/package.model';
import styles from './destination-card.module.scss';
import { MatchCard } from '@pages/PackageDetailsScreen/MatchCard';
import { Calendar } from 'lucide-react';
import { formattedDate } from '@/utils/date.utils.ts';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';

const { Title, Text } = Typography;

interface DestinationCardProps {
    destination: Destination;
}

export const DestinationCard = ({ destination }: DestinationCardProps) => (
    <div className={styles.destinationCard}>
        <div className={styles.header}>
            <div className={styles.left}>
                <Tag className={styles.city}>{destination.city}</Tag>
                <Text className={styles.destinationDates}>
                    <Calendar className={styles.calendarIcon} />
                    {formattedDate(destination.startDate)} <ArrowRightOutlined className={styles.arrowIcon} />
                    {formattedDate(destination.endDate)}
                </Text>
            </div>
            <Text className={styles.destinationMatches}>
                <strong>{destination.matches.length} Matches</strong>
            </Text>
        </div>
        <div className={styles.divider} />
        <div className={styles.matchesSection}>
            {destination.matches.map((match, index) => (
                <MatchCard match={match} itemIndex={index} />
            ))}
        </div>
    </div>
);
