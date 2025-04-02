import {Skeleton} from 'antd';
import styles from './package-skeleton.module.scss';

export const PackageSkeleton = () => {
    return (
        <>
            {Array.from({length: 3}).map((_, index) => (
                <div className={styles.skeletonCard} key={index}>
                    <div className={styles.skeletonMatches}>

                        <div className={styles.matchItem}>
                            <div className={styles.matchTop}>
                                <Skeleton.Input style={{height: 20, width: 30}} active/>
                                <Skeleton.Input style={{height: 20, width: 30}} active/>
                            </div>
                            <div className={styles.matchItemMain}>
                                <div className={styles.teamsLogos}>
                                    <Skeleton.Avatar shape="square" size={100} active/>
                                    <Skeleton.Avatar shape="square" size={100} active/>
                                </div>
                                <div className={styles.matchHeader}>
                                    <Skeleton.Input style={{height: 20, width: 100}} active/>
                                    <Skeleton.Input style={{height: 20, width: 250}} active/>
                                    <Skeleton.Input style={{height: 20, width: 200, marginTop: 20}} active/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.skeletonFooter}>
                        <Skeleton.Button style={{width: 200}} active/>
                        <Skeleton.Button style={{width: 120, marginLeft: 'auto'}} active/>
                    </div>
                </div>
            ))}
        </>
    );
};
