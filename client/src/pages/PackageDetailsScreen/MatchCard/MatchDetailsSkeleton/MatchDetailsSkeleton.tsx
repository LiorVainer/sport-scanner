import { Skeleton } from 'antd';
import styles from './match-details-skeleton.module.scss';
import originalStyles from '../MatchDetails/match-details.module.scss';
import { ExportOutlined } from '@ant-design/icons';

export const MatchDetailsSkeleton = () => {
    return (
        <div className={styles.matchDetailsContainer}>
            <div className={styles.matchDetails}>
                <Skeleton.Avatar active size={90} shape="circle" />
                <div className={styles.matchInfo}>
                    <Skeleton.Input active className={styles.matchTeamsSkeleton} />
                    <div className={styles.matchMeta}>
                        <Skeleton.Input active className={styles.metaButtonSkeleton} />
                        <Skeleton.Input active className={styles.metaButtonSkeleton} />
                    </div>
                </div>
                <Skeleton.Avatar active size={90} shape="circle" />
            </div>

            <div className={styles.matchDatePrice}>
                <div className={styles.matchDayContainer}>
                    <Skeleton.Input active className={styles.dateSkeleton} />
                    <Skeleton.Input active className={styles.daySkeleton} />
                </div>
                <div className={styles.matchPriceInfo}>
                    <Skeleton.Input active className={styles.priceTextSkeleton} />
                    <button className={originalStyles.matchTicketButton}>
                        <ExportOutlined />
                        Match Tickets
                    </button>
                </div>
            </div>
        </div>
    );
};
