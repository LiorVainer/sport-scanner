import { ROUTES } from '@/constants/routes.const';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';
import classes from './groups-screen.module.scss';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { useQuery } from '@tanstack/react-query';
import { GroupService } from '@api/services/group.service.ts';
import { GroupCardSkeleton } from '@components/GroupCardSkeleton/GroupCardSkeleton.tsx';

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
            <div className={classes.container}>
                <h1>No Groups Found</h1>
                <Button type="primary" icon={<EditOutlined />} onClick={handleNewGroup} className={classes.addButton}>
                    Create New Group
                </Button>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h1>Your Groups</h1>
                <Button type="primary" icon={<EditOutlined />} onClick={handleNewGroup} className={classes.addButton}>
                    Create New Group
                </Button>
            </div>

            {!isLoading && groups
                ? groups.map((group, idx) => <GroupCard key={idx} group={group} />)
                : Array.from({ length: 3 }).map((_, index) => <GroupCardSkeleton key={index} />)}
        </div>
    );
};
