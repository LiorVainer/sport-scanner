import { Skeleton } from 'antd';
import clsx from 'clsx';
import styles from './package-skeleton.module.scss';

interface PackageSkeletonProps {
    variant?: 'full' | 'compact';
}

export const PackageSkeleton = ({ variant = 'full' }: PackageSkeletonProps) => {
    const isCompact = variant === 'compact';
    const avatarSize = isCompact ? 60 : 100;
    const inputHeight = isCompact ? 16 : 20;
    const smallW = isCompact ? 24 : 30;
    const medW = isCompact ? 80 : 100;
    const largeW = isCompact ? 150 : 250;
    const footerW1 = isCompact ? 120 : 200;
    const footerW2 = isCompact ? 90 : 120;

    return (
        <div className={clsx(styles.skeletonCard, isCompact && styles.compactCard)}>
            <div className={clsx(styles.skeletonMatches, isCompact && styles.compactMatches)}>
                <div className={styles.matchItem}>
                    <div className={styles.matchTop}>
                        <Skeleton.Input active style={{ height: inputHeight, width: smallW }} />
                        <Skeleton.Input active style={{ height: inputHeight, width: smallW }} />
                    </div>
                    <div className={styles.matchItemMain}>
                        <div className={styles.teamsLogos}>
                            <Skeleton.Avatar shape="square" size={avatarSize} active />
                            <Skeleton.Avatar shape="square" size={avatarSize} active />
                        </div>
                        <div className={styles.matchHeader}>
                            <Skeleton.Input active style={{ height: inputHeight, width: medW }} />
                            <Skeleton.Input active style={{ height: inputHeight, width: largeW }} />
                            <Skeleton.Input
                                active
                                style={{
                                    height: inputHeight,
                                    width: largeW - 50,
                                    marginTop: isCompact ? 12 : 20,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={clsx(styles.skeletonFooter, isCompact && styles.compactFooter)}>
                <Skeleton.Button active style={{ width: footerW1 }} />
                <Skeleton.Button active style={{ width: footerW2, marginLeft: 'auto' }} />
            </div>
        </div>
    );
};
