import { Skeleton } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from '../FlightLabel/flight-label.module.scss';
import { faPlaneDeparture } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const FlightLabelSkeleton = () => (
    <div className={styles.flightLabelContainer}>
        <div className={styles.flightTag}>
            <FontAwesomeIcon icon={faPlaneDeparture} />
            Flight
        </div>
        <div className={styles.flightRoute}>
            <Skeleton.Input active className={styles.citySkeleton} />
            <ArrowRightOutlined className={styles.arrowIcon} />
            <Skeleton.Input active className={styles.citySkeleton} />
        </div>
    </div>
);
