import { Skeleton } from 'antd';
import { Calendar } from 'lucide-react';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from '../DestinationCard/destination-card.module.scss';
import { MatchCardSkeleton } from '../MatchCard/MatchCardSkeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

type Props = {
    matchesAmount?: number;
};

export const DestinationCardSkeleton = ({ matchesAmount }: Props) => {
    return (
        <div className={styles.destinationCard}>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.city}>
                        <FontAwesomeIcon icon={faLocationDot} />
                        Destination
                    </div>
                    <div className={styles.destinationDates}>
                        <Calendar className={styles.calendarIcon} />
                        <Skeleton.Input active className={styles.dateSkeleton} />
                        <ArrowRightOutlined className={styles.arrowIcon} />
                        <Skeleton.Input active className={styles.dateSkeleton} />
                    </div>
                </div>
                <Skeleton.Input active className={styles.matchesCountSkeleton} />
            </div>

            <div className={styles.divider} />

            <div className={styles.matchesSection}>
                {Array.from({ length: matchesAmount ?? 2 }).map((_, i) => (
                    <MatchCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};
