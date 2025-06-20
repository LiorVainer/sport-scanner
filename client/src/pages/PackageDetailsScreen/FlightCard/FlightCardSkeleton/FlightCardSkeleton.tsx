import styles from '../flight-card.module.scss';
import { FlightLabelSkeleton } from '@pages/PackageDetailsScreen/FlightCard/FlightLabelSkeleton';
import { FlightDetailsSkeleton } from '@pages/PackageDetailsScreen/FlightCard/FlightDetailsSkeleton';

export const FlightCardSkeleton = () => (
    <div className={styles.flightCardContainer}>
        <FlightLabelSkeleton />
        <FlightDetailsSkeleton />
    </div>
);
