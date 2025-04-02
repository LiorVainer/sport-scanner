import {ArrowRightOutlined, EnvironmentOutlined} from '@ant-design/icons';
import styles from './match-header.module.scss';
import {Tag, Typography} from 'antd';
import {formattedDate} from '@/utils/date.utils';

const {Text} = Typography;

interface MatchHeaderProps {
    startDate: string;
    endDate: string;
    location: string;
}

export const MatchHeader = ({startDate, endDate, location}: MatchHeaderProps) => {
    console.log({startDate, endDate, location});
    return (
        <div className={styles.matchHeaderContainer}>
            <Text strong className={styles.matchDates}>
                {formattedDate(startDate)} <ArrowRightOutlined className={styles.arrowIcon}/>
                {formattedDate(endDate)}
            </Text>
            <Tag icon={<EnvironmentOutlined/>} className={styles.locationTag}>
                {location}
            </Tag>
        </div>
    );
};
