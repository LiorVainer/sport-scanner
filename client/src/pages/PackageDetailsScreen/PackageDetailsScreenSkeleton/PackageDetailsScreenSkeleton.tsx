import { Skeleton } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined, PushpinOutlined } from '@ant-design/icons';
import styles from '../package-details-screen.module.scss';
import originalStyles from '../package-details-screen.module.scss';
import { FlightCardSkeleton } from '@pages/PackageDetailsScreen/FlightCard/FlightCardSkeleton';
import { DestinationCardSkeleton } from '@pages/PackageDetailsScreen/DestinationCardSkeleton';

export const PackageDetailsScreenSkeleton = () => {
    return (
        <div className={styles.packagePage}>
            <div className={styles.packageHeader}>
                <div className={styles.backArrow}>
                    <ArrowLeftOutlined className={styles.backIcon} />
                </div>

                <div className={styles.packageInfo}>
                    <Skeleton.Input active className={styles.packageTitleSkeleton} />
                    <Skeleton paragraph={{ rows: 2, className: styles.packageDescriptionSkeleton }} active />
                </div>

                <div className={styles.packageDetails}>
                    <div className={styles.packageDetailsContainerSkeleton}>
                        <div className={styles.packageDate}>
                            <CalendarOutlined className={styles.calendarIcon} />
                            <Skeleton.Input active className={styles.dateSkeleton} />
                            <ArrowRightOutlined className={styles.arrowIcon} />
                            <Skeleton.Input active className={styles.dateSkeleton} />
                        </div>
                        <Skeleton.Input active className={styles.priceSkeleton} />
                    </div>
                    <button className={originalStyles.saveButton}>
                        <PushpinOutlined />
                        Add To Saved
                    </button>
                </div>
            </div>

            <div className={styles.cardsSection}>
                {Array.from({ length: 1 }).map((_, i) => (
                    <FlightCardSkeleton key={`flight-${i}`} />
                ))}
                {Array.from({ length: 1 }).map((_, i) => (
                    <DestinationCardSkeleton key={`dest-${i}`} />
                ))}

                {Array.from({ length: 1 }).map((_, i) => (
                    <FlightCardSkeleton key={`flight-${i}`} />
                ))}
                {Array.from({ length: 1 }).map((_, i) => (
                    <DestinationCardSkeleton key={`dest-${i}`} />
                ))}

                {Array.from({ length: 1 }).map((_, i) => (
                    <FlightCardSkeleton key={`flight-${i}`} />
                ))}
            </div>
        </div>
    );
};
