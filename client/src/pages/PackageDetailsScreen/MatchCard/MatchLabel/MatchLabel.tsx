import { Tag, Typography } from 'antd';
import styles from './match-label.module.scss';
import { ArrowRightOutlined } from '@ant-design/icons';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface MatchLabelProps {
    label: string;
    location: string;
    from: string;
    to: string;
}

export const MatchLabel = ({ label, location, from, to }: MatchLabelProps) => (
    <div className={styles.matchLabelContainer}>
        <Tag className={styles.matchTag}>{label}</Tag>
        <Text strong className={styles.matchLocation}>
            {location} ({formattedDate(from)} <ArrowRightOutlined className={styles.arrowIcon} /> {formattedDate(to)})
        </Text>
    </div>
);
