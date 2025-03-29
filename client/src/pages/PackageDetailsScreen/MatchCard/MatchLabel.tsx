import React from 'react';
import { Tag, Typography } from 'antd';
import styles from './scss/match-label.module.scss';
import { ArrowRightOutlined } from '@ant-design/icons';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface MatchLabelProps {
    label: string;
    location: string;
    from: string;
    to: string;
}

const MatchLabel = ({ label, location, from, to }: MatchLabelProps) => (
    <div className={styles['match-label-container']}>
        <Tag className={styles['match-tag']}>
            {label}
        </Tag>
        <Text strong className={styles['match-location']}>
            {location} ({formattedDate(from)} <ArrowRightOutlined className={styles['arrow-icon']} />{' '}
            {formattedDate(to)})
        </Text>
    </div>
);

export default MatchLabel;
