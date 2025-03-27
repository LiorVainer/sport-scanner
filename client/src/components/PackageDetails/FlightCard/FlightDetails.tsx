import React from 'react';
import { Typography, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './scss/flight-details.module.scss';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface FlightDetailsProps {
    from: string;
    to: string;
    departureDate: string;
    price: number;
}

const FlightDetails = ({ from, to, departureDate, price }: FlightDetailsProps) => {
    return (
        <div className={styles['flight-details-container']}>
            <div className={styles['flight-route-info']}>
                <svg
                    width="22"
                    height="18"
                    viewBox="0 0 22 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles['airplane-icon']}
                >
                    <path
                        d="M1.50009 15.9999H20.5001V17.9999H1.50009V15.9999ZM21.0701 6.63995C20.8601 5.83995 20.0301 5.35995 19.2301 5.57995L13.9201 6.99995L7.02009 0.569946L5.09009 1.07995L9.23009 8.24995L4.26009 9.57995L2.29009 8.03995L0.840088 8.42995L2.66009 11.5899L3.43009 12.9199L20.0001 8.48995C20.8101 8.25995 21.2801 7.43995 21.0701 6.63995Z"
                        fill="#4B4B4B"
                    />
                </svg>
                <Text strong className={styles['flight-route']}>
                    {from} <ArrowRightOutlined className={styles['arrow-icon']} />
                    {to}
                </Text>
                <Text type="secondary" className={styles['flight-date']}>
                    ({formattedDate(departureDate)})
                </Text>
            </div>
            <div className={styles['flight-price-info']}>
                <Text className={styles['price-text']}>from </Text>
                <Text strong className={styles['price-amount']}>
                    {price}$ {/* add currency */}
                </Text>
                <Button type="primary" className={styles['flight-ticket-button']}>
                    Flight Tickets
                </Button>
            </div>
        </div>
    );
};

export default FlightDetails;
