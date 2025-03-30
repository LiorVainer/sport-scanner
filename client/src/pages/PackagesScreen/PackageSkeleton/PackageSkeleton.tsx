import { ArrowRightOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import styles from './package-skeleton.module.scss';

export const PackageSkeleton = () => {
    return (
        <>
            {Array.from({ length: 3 }).map((_, index) => (
                <div className={styles.skeletonCard} key={index}>
                    <div className={styles.skeletonMatches}>
                        {Array.from({ length: 2 }).map((_, matchIndex) => (
                            <div className={styles.skeletonMatchItem} key={matchIndex}>
                                <Skeleton.Avatar shape="square" size={64} active />
                                <div>
                                    <Skeleton.Input style={{ width: 150 }} active />
                                    <Skeleton.Input style={{ width: 100, marginTop: 4 }} active />
                                </div>
                                {matchIndex !== 1 && <ArrowRightOutlined className={styles.skeletonArrowIcon} />}
                            </div>
                        ))}
                    </div>
                    <div className={styles.skeletonFooter}>
                        <Skeleton.Button style={{ width: 120 }} active />
                        <Skeleton.Button style={{ width: 80, marginLeft: 'auto' }} active />
                    </div>
                </div>
            ))}
        </>
    );
};
