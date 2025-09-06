import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';
import classes from './groups-screen.module.scss';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { useQuery } from '@tanstack/react-query';
import { GroupService } from '@api/services/group.service.ts';
import { Screen } from '@components/Screen';
import { GroupCardSkeleton } from '@components/GroupCardSkeleton/GroupCardSkeleton.tsx';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const GroupsScreen = () => {
    const navigate = useNavigate();

    const { data: groups, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => GroupService.getAll(),

        refetchOnWindowFocus: false,
        // staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleNewGroup = () => {
        navigate(ROUTES.ADD_GROUP);
    };

    if (groups && groups.length === 0) {
        return (
            <Screen className={classes.container}>
                <h1>No Groups Found</h1>
                <button onClick={handleNewGroup} className={classes.addButton}>
                    <EditOutlined />
                    Create New Group
                </button>
            </Screen>
        );
    }

    return (
        <Screen className={classes.container}>
            <div className={classes.header}>
                <div className={classes.titleContainer}>
                    <FontAwesomeIcon icon={faPeopleGroup} />
                    <h1>Your Groups</h1>
                </div>
                <button onClick={handleNewGroup} className={classes.addButton}>
                    <EditOutlined />
                    Create New Group
                </button>
            </div>

            {!isLoading && groups
                ? groups.map((group, idx) => <GroupCard key={idx} group={group} />)
                : Array.from({ length: 3 }).map((_, index) => <GroupCardSkeleton key={index} />)}
        </Screen>
    );
};
