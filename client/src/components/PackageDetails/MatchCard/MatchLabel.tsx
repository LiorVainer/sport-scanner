import React from 'react';
import { Tag, Typography } from 'antd';
import styles from './scss/match-label.module.scss';
import { ArrowRightOutlined } from '@ant-design/icons';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface MatchLabelProps {
    label: string;
    location: string;
    departureDate: string;
    matchDate: string;
}

const MatchLabel = ({ label, location, departureDate, matchDate }: MatchLabelProps) => (
    <div className={styles['match-label-container']}>
        <Tag color="#2F4F6F" className={styles['match-tag']}>
            {label}
        </Tag>
        <Text strong className={styles['match-location']}>
            {location} ({formattedDate(departureDate)} <ArrowRightOutlined className={styles['arrow-icon']} />{' '}
            {formattedDate(matchDate)})
        </Text>
    </div>
);

export default MatchLabel;
