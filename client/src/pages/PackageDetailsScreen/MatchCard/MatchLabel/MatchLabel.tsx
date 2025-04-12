import { Tag } from 'antd';
import styles from './match-label.module.scss';

interface MatchLabelProps {
    label: string;
}

export const MatchLabel = ({ label }: MatchLabelProps) => (
    <div className={styles.matchLabelContainer}>
        <Tag className={styles.matchTag}>{label}</Tag>
    </div>
);
