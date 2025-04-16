import {ArrowRightOutlined, EnvironmentOutlined} from '@ant-design/icons';
import styles from './destination-header.module.scss';
import {Tag, Typography} from 'antd';
import {formattedDate} from '@/utils/date.utils.ts';
import {Destination} from "@/models/packages/package.model.ts";

const {Text} = Typography;

interface DestinationHeaderProps {
    destination: Destination;
}

export const DestinationHeader = ({destination}: DestinationHeaderProps) => (
    <div className={styles.matchHeaderContainer}>
        <Text strong className={styles.matchDates}>
            {formattedDate(destination.startDate)} <ArrowRightOutlined className={styles.arrowIcon}/>
            {formattedDate(destination.endDate)}
        </Text>
        <Tag icon={<EnvironmentOutlined/>} className={styles.locationTag}>
            {destination.city}
        </Tag>
    </div>
);
