import { Skeleton } from 'antd';
import styles from '../GroupCard/group-card.module.scss';

export const GroupCardSkeleton = () => {
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.groupInfo}>
                    {/* Title */}
                    <Skeleton.Input active style={{ width: 200, height: 32, marginBottom: 8 }} />
                    {/* Meta info */}
                    <div className={styles.metaInfo}>
                        <Skeleton.Input active style={{ width: 120, height: 20 }} />
                        <Skeleton.Input active style={{ width: 80, height: 20, marginLeft: 16 }} />
                    </div>
                </div>
                {/* Avatars */}
                <div className={styles.avatars}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton.Avatar
                            key={i}
                            active
                            size={32}
                            style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid #fff' }}
                        />
                    ))}
                </div>
            </div>

            {/*/!* Selected Package Preview *!/*/}
            {/*<div className={styles.selectedPackage}>*/}
            {/*    <div className={styles.matchList}>*/}
            {/*        /!* Two compact match placeholders *!/*/}
            {/*        <Skeleton.Avatar shape="square" active size={60} />*/}
            {/*        <span className={styles.arrow}>→</span>*/}
            {/*        <Skeleton.Avatar shape="square" active size={60} />*/}
            {/*    </div>*/}
            {/*    /!* Footer button placeholder *!/*/}
            {/*    <Skeleton.Button active style={{ width: 140, height: 32, alignSelf: 'flex-end' }} />*/}
            {/*</div>*/}
        </div>
    );
};
