import { Button, Spin, Timeline } from 'antd';
import styles from './packages-generation-progress-timeline.module.scss';
import { usePackages } from '@/context/PackagesContext.tsx';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ProgressTimelineItem } from '@pages/PackagesScreen/PackagesGenerationProgressTimeline/components/ProgressTimelineItem';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';

export const PackagesGenerationProgressTimeline = () => {
    const { progressSteps, hideProgressSteps, setHideProgressSteps, isLoading, packages } = usePackages();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <h4 className={styles.title}>
                        {isLoading ? 'Generating Packages' : `Generated ${packages?.length} Packages`}
                    </h4>
                    {isLoading && <Spin />}
                </div>
                <Button
                    type="primary"
                    className={styles.hideButton}
                    onClick={() => setHideProgressSteps(!hideProgressSteps)}
                >
                    {hideProgressSteps ? 'Show' : 'Hide'} Progress
                </Button>
            </div>

            {!hideProgressSteps && (
                <Timeline className={styles.timeline}>
                    {progressSteps.map((step, idx) => {
                        const isDone =
                            idx < progressSteps.length - 1 ||
                            step.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES;
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
                                <ProgressTimelineItem step={step} />
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            )}
        </div>
    );
};
