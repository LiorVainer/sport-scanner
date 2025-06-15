import { Spin, Timeline } from 'antd';
import styles from './packages-generation-progress-timeline.module.scss';
import { usePackages } from '@/context/PackagesContext.tsx';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ProgressTimelineItem } from '@pages/PackagesScreen/PackagesGenerationProgressTimeline/components/ProgressTimelineItem';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';

export const PackagesGenerationProgressTimeline = () => {
    const { progressUpdates, hideProgressTimeline, setHideProgressTimeline, isLoading, packages } = usePackages();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <h4 className={styles.title}>
                        {isLoading ? 'Generating Packages' : `Generated ${packages?.length} Packages`}
                    </h4>
                    {isLoading && <Spin />}
                </div>
                <button className={styles.hideButton} onClick={() => setHideProgressTimeline(!hideProgressTimeline)}>
                    {hideProgressTimeline ? 'Show' : 'Hide'} Progress
                </button>
            </div>

            {!hideProgressTimeline && (
                <Timeline className={styles.timeline}>
                    {progressUpdates.map((progressUpdate, index) => {
                        const isDone =
                            index < progressUpdates.length - 1 ||
                            progressUpdate.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES;
                        return (
                            <Timeline.Item
                                dot={
                                    isDone ? (
                                        <CheckCircleOutlined style={{ color: 'green' }} />
                                    ) : (
                                        <ClockCircleOutlined />
                                    )
                                }
                                color={isDone ? 'green' : 'blue'}
                                className={styles.timelineItem}
                            >
                                <ProgressTimelineItem progressUpdate={progressUpdate} />
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            )}
        </div>
    );
};
