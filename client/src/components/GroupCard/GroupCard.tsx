import { Avatar, Tooltip, Typography } from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { Group } from '@/models/group.model';
import { MatchDetails } from '@/components/MatchDetails/MatchDetails';
import styles from './group-card.module.scss';
import { ROUTES } from '@/constants/routes.const.ts';
import { PackageFooter } from '@pages/PackagesScreen/PackageFooter';
import { formattedDate } from '@/utils/date.utils.ts';
import { useNavigate } from 'react-router-dom';
import { Package } from '@/models/packages/package.model.ts';

const { Title, Text } = Typography;

interface GroupCardProps {
    group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
    const { title, users, selectedPackage, maxBudget, dates } = group;

    const navigate = useNavigate();

    const handleGroupClick = () => {
        navigate(`${ROUTES.GROUP_DETAILS}/${group._id}`, { state: { group } });
    };

    return (
        <div onClick={handleGroupClick} className={styles.container}>
            <div className={styles.header}>
                <div className={styles.groupInfo}>
                    <Title level={4}>{title}</Title>
                    <div className={styles.metaInfo}>
                        <Text>
                            <CalendarOutlined /> {formattedDate(dates.start)} → {formattedDate(dates.end)}
                        </Text>
                        <Text>
                            <DollarOutlined /> {maxBudget}$
                        </Text>
                    </div>
                </div>
                <div className={styles.avatars}>
                    {users.map((member) => (
                        <Tooltip key={member._id} title={member.username}>
                            <Avatar src={member.picture} />
                        </Tooltip>
                    ))}
                </div>
            </div>

            {selectedPackage && <SelectedGroupPackage selectedPackage={selectedPackage} />}
        </div>
    );
};

export type SelectedGroupPackageProps = {
    selectedPackage: Package;
};

export const SelectedGroupPackage = ({ selectedPackage }: SelectedGroupPackageProps) => {
    const { timeline } = selectedPackage;
    const destinations = timeline.filter((item) => item.type === 'destination');
    const matches = destinations.flatMap((dest) => dest.matches || []);

    return (
        <div className={styles.selectedPackage}>
            <div className={styles.matchList}>
                {matches.length === 0 && <Text>No matches scheduled</Text>}

                {matches.length === 1 && <MatchDetails variant={'compact'} match={matches[0]} />}

                {matches.length === 2 && (
                    <>
                        <MatchDetails variant={'compact'} match={matches[0]} />
                        <span className={styles.arrow}>→</span>
                        <MatchDetails variant={'compact'} match={matches[1]} />
                    </>
                )}
            </div>
            {selectedPackage && (
                <PackageFooter
                    variant={'compact'}
                    singlePackage={selectedPackage}
                    actionLabel={'See Selected Package'}
                />
            )}
        </div>
    );
};
