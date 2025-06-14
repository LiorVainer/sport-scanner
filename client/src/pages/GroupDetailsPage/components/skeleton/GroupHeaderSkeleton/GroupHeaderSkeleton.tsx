import { Skeleton } from 'antd';
import styles from './group-header-skeleton.module.scss';

export const GroupHeaderSkeleton = () => {
    return (
        <div className={styles.groupHeaderBox}>
            <div className={styles.topRow}>
                <div className={styles.left}>
                    <Skeleton.Input active style={{ width: 220, height: 26 }} />
                    <Skeleton.Input active style={{ width: 140, height: 18 }} />
                    <div className={styles.avatars}>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className={styles.avatarBlock}>
                                <Skeleton.Avatar active size={36} />
                                <Skeleton.Input active style={{ width: 40, height: 12 }} size="small" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.right}>
                    <div className={styles.info}>
                        <Skeleton.Input active style={{ width: 120, height: 18 }} />
                        <Skeleton.Input active style={{ width: 180, height: 18 }} />
                    </div>
                    <div className={styles.groupActionsRow}>
                        <Skeleton.Button active style={{ width: 100 }} />
                        <Skeleton.Button active style={{ width: 100 }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
