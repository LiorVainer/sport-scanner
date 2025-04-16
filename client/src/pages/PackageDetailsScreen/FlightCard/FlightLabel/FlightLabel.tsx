import {Tag, Typography} from 'antd';
import {ArrowRightOutlined} from '@ant-design/icons';
import styles from './flight-label.module.scss';
import {Flight} from "@/models/packages/package.model.ts";
import {FlightPurposeToFlightLabelMap} from "@/constants/flight.const.ts";

const {Text} = Typography;

interface FlightLabelProps {
    flight: Flight;
}

export const FlightLabel = ({flight}: FlightLabelProps) => (
    <div className={styles.flightLabelContainer}>
        <Tag className={styles.flightTag}>{`${FlightPurposeToFlightLabelMap[flight.purpose]} Flight`}</Tag>
        <Text strong className={styles.flightRoute}>
            {flight.origin.name} <ArrowRightOutlined className={styles.arrowIcon}/> {flight.destination.name}
        </Text>
    </div>
);
