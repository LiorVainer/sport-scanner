import { Skeleton } from 'antd';
import clsx from 'clsx';
import styles from './package-skeleton.module.scss';

interface PackageSkeletonProps {
    variant?: 'full' | 'compact';
    isFullHeight?: boolean;
    isActive?: boolean;
}

export const PackageSkeleton = ({ variant = 'full', isFullHeight = false, isActive = true }: PackageSkeletonProps) => {
    const isCompact = variant === 'compact';
    const avatarSize = isCompact ? 60 : 100;
    const lineHeight = isCompact ? 16 : 20;
    const titleWidth = isCompact ? 180 : 240;

    return (
        <div className={clsx(styles.packageCardContainer, { [styles.fullHeight]: isFullHeight })}>
            {/* Sticky Header Skeleton */}
            <div className={styles.packageHeader}>
                <Skeleton.Input
                    active={isActive}
                    style={{ width: titleWidth, height: 20, marginTop: 4 }}
                    size="small"
                />
            </div>

            <div className={styles.packageCard}>
                <div className={styles.content}>
                    <div className={styles.destinations}>
                        {Array.from({ length: 2 }).map((_, idx) => (
                            <div key={idx} className={styles.destinationSection}>
                                <Skeleton.Avatar active={isActive} shape="square" size={avatarSize} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <Skeleton.Input active={isActive} style={{ width: 80, height: lineHeight }} />
                                    <Skeleton.Input active={isActive} style={{ width: 80, height: lineHeight }} />
                                </div>
                                <Skeleton.Avatar active={isActive} shape="square" size={avatarSize} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className={styles.skeletonFooter}>
                    <Skeleton.Button active={isActive} style={{ width: 140 }} />
                    <Skeleton.Button active={isActive} style={{ width: 100, marginLeft: 'auto' }} />
                </div>
            </div>
        </div>
    );
};
