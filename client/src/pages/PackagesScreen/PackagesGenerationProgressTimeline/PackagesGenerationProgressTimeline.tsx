import {Button, Spin, Timeline} from "antd";
import styles from "./packages-generation-progress-timeline.module.scss";
import {CheckCircleOutlined, ClockCircleOutlined} from "@ant-design/icons";
import {usePackages} from "@/context/PackagesContext.tsx";
import {getProgressStepMessage} from "@/utils/packages.utils.ts";
import {FixturesToFlattenedDetails} from "@/utils/fixture.utils.ts";
import {GeneratePackagesSteps} from "@/models/packages/packages-generate-steps.model.ts";
import moment from "moment";

export const PackagesGenerationProgressTimeline = () => {
    const {progressSteps, hideProgressSteps, setHideProgressSteps, isLoading, packages} = usePackages();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <h4 className={styles.title}>{isLoading ? "Generating Packages" : `Generated ${packages?.length} Packages For You`}</h4>
                    {isLoading && <Spin/>}
                </div>
                <Button
                    type="primary"
                    className={styles.hideButton}
                    onClick={() => setHideProgressSteps(!hideProgressSteps)}
                >
                    {hideProgressSteps ? 'Show' : 'Hide'} Progress
                </Button>
            </div>
            {!hideProgressSteps && <Timeline className={styles.timeline}>
                {progressSteps.map((step, idx) => {
                    const isCurrent = idx === progressSteps.length - 1;
                    const isDone = !isCurrent || step.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES;
                    const message = getProgressStepMessage(step);

                    return (
                        <Timeline.Item
                            key={idx}
                            dot={isDone ? <CheckCircleOutlined style={{color: 'green'}}/> : <ClockCircleOutlined/>}
                            color={isDone ? 'green' : 'blue'}
                            className={styles.timelineItem}
                        >
                            <div className={styles.timelineMessage}>
                                <strong>{message}</strong>
                            </div>

                            {'fixtures' in step && step.fixtures.length > 0 && (
                                <div className={styles.infoBlock}>
                                    <div className={styles.fixtureList}>
                                        {FixturesToFlattenedDetails(step.fixtures).map(({homeTeam, awayTeam, date}) =>
                                            <div className={styles.fixtureItem}>
                                                <div className={styles.fixtureTeams}>
                                                    <div className={styles.teamDetails}>
                                                        <p className={styles.teamName}>{homeTeam.name}</p>
                                                        <img src={homeTeam.logo} alt={homeTeam.name}
                                                             className={styles.teamLogo}/>
                                                    </div>
                                                    <span className={styles.vs}>VS</span>
                                                    <div className={styles.teamDetails}>
                                                        <img src={awayTeam.logo} alt={awayTeam.name}
                                                             className={styles.teamLogo}/>
                                                        <p className={styles.teamName}>{awayTeam.name}</p>
                                                    </div>
                                                </div>
                                                <p className={styles.fixtureDate}>
                                                    {moment(new Date(date)).format('DD/MM')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Timeline.Item>
                    );
                })}
            </Timeline>}
        </div>
    );
};
