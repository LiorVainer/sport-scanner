import { ArrowRightOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from './match-header.module.scss';
import { Tag, Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface MatchHeaderProps {
    from: string;
    to: string;
    location: string;
}

export const MatchHeader = ({ from, to, location }: MatchHeaderProps) => {
    return (
        <div className={styles.matchHeaderContainer}>
            <Text strong className={styles.matchDates}>
                {formattedDate(from)} <ArrowRightOutlined className={styles.arrowIcon} />
                {formattedDate(to)}
            </Text>
            <Tag icon={<EnvironmentOutlined />} className={styles.locationTag}>
                {location}
            </Tag>
        </div>
    );
};