import React from 'react';
import { ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from './match-header.module.scss';
import { Tag, Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';

const {Text} = Typography;

interface MatchHeaderProps {
    from: string;
    to: string;
    location: string
}

const MatchHeader = ({ from, to, location }:MatchHeaderProps) => {
    return (
        <div className={styles['match-header-container']}>
            <Text strong className={styles['match-dates']}>
                {formattedDate(from)} <ArrowRightOutlined className={styles['arrow-icon']} />{formattedDate(to)}
            </Text>
            <Tag icon={<EnvironmentOutlined />} className={styles['location-tag']}>
                {location}
            </Tag>
        </div>
    );
};

export default MatchHeader;
