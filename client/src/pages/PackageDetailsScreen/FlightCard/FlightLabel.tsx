import React from 'react';
import { Tag, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './scss/flight-label.module.scss';

const { Text } = Typography;

interface FlightLabelProps {
    label: string;
    from: string;
    to: string;
}

const FlightLabel = ({ label, from, to }: FlightLabelProps) => (
    <div className="flight-label-container">
        <Tag className={styles['flight-tag']}>
            {label}
        </Tag>
        <Text strong className={styles['flight-route']}>
            {from} <ArrowRightOutlined className={styles['arrow-icon']} /> {to}
        </Text>
    </div>
);

export default FlightLabel;
