import { Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './flight-label.module.scss';

const { Text } = Typography;

interface FlightLabelProps {
    label: string;
    from: string;
    to: string;
}

export const FlightLabel = ({ label, from, to }: FlightLabelProps) => (
    <div className={styles.flightLabelContainer}>
        <Tag className={styles.flightTag}>{label}</Tag>
        <Text strong className={styles.flightRoute}>
            {from} <ArrowRightOutlined className={styles.arrowIcon} /> {to}
        </Text>
    </div>
);
