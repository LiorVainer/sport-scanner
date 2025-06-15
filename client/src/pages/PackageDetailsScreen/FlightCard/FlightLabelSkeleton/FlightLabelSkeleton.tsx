import { Skeleton, Tag } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from '../FlightLabel/flight-label.module.scss';

export const FlightLabelSkeleton = () => (
    <div className={styles.flightLabelContainer}>
        <Tag className={styles.flightTag}>Flight</Tag>
        <div className={styles.flightRoute}>
            <Skeleton.Input active className={styles.citySkeleton} />
            <ArrowRightOutlined className={styles.arrowIcon} />
            <Skeleton.Input active className={styles.citySkeleton} />
        </div>
    </div>
);
