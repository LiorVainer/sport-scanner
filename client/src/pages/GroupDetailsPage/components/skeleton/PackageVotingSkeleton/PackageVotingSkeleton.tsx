import { Skeleton } from 'antd';
import styles from './package-voting-skeleton.module.scss';

export const PackageVotingSkeleton = () => {
    return (
        <div className={styles.packageVoting}>
            <h3 style={{ width: 180, height: 28, marginBottom: 16 }}>Packages Voting</h3>

            <div className={styles.barsContainer}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div className={styles.voteBar} key={index}>
                        <div className={styles.barBg}>
                            <div className={styles.barFill} />
                        </div>
                        <Skeleton.Input active size="small" style={{ width: 60, height: 14, marginTop: 6 }} />
                    </div>
                ))}
            </div>
        </div>
    );
};
