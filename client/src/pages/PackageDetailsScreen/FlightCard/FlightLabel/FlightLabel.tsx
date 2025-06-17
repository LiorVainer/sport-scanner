import { Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './flight-label.module.scss';
import { Flight } from '@/models/packages/package.model.ts';
import { FlightPurposeToFlightLabelMap, FlightPurposeToIcon } from '@/constants/flight.const.tsx';

const { Text } = Typography;

interface FlightLabelProps {
    flight: Flight;
}

export const FlightLabel = ({ flight }: FlightLabelProps) => (
    <div className={styles.flightLabelContainer}>
        <div className={styles.flightTag}>
            {FlightPurposeToIcon[flight.purpose]}
            {`${FlightPurposeToFlightLabelMap[flight.purpose]} Flight`}
        </div>
        <Text strong className={styles.flightRoute}>
            {flight.origin.name} <ArrowRightOutlined className={styles.arrowIcon} /> {flight.destination.name}
        </Text>
    </div>
);
