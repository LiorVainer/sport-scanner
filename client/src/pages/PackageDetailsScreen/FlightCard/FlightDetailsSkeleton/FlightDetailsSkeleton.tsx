import { Button, Skeleton } from 'antd';
import { ArrowRightOutlined, ExportOutlined } from '@ant-design/icons';
import { TicketsPlane } from 'lucide-react';
import styles from './flight-details-skeleton.module.scss';
import originStyles from '../FlightDetails/flight-details.module.scss';

export const FlightDetailsSkeleton = () => {
    return (
        <div className={styles.flightDetailsContainer}>
            <div className={styles.flightRouteInfo}>
                <div className={styles.flightRouteSection}>
                    <TicketsPlane className={styles.airplaneIcon} />
                    <div className={styles.flightRoute}>
                        <Skeleton.Input active className={styles.citySkeleton} />
                        <ArrowRightOutlined className={styles.arrowIcon} />
                        <Skeleton.Input active className={styles.citySkeleton} />
                    </div>
                </div>
                <Skeleton.Input active className={styles.dateSkeleton} />
            </div>

            <div className={styles.flightPriceInfo}>
                <div className={styles.priceContainer}>
                    <Skeleton.Input active className={styles.priceTextSkeleton} />
                </div>
                <Button
                    type="primary"
                    color={'purple'}
                    icon={<ExportOutlined />}
                    className={originStyles.flightTicketButton}
                >
                    Flight Tickets
                </Button>
            </div>
        </div>
    );
};
