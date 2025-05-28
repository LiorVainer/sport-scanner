import { ROUTES } from '@/constants/routes.const';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';
import classes from './groups-screen.module.scss';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { useQuery } from '@tanstack/react-query';
import { GroupService } from '@api/services/group.service.ts';

export const GroupsScreen = () => {
    const navigate = useNavigate();

    const { data: groups, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => GroupService.getAll(),

        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleNewGroup = () => {
        navigate(ROUTES.ADD_GROUP);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!groups || groups.length === 0) {
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

            {groups.map((group, idx) => (
                <GroupCard key={idx} group={group} />
            ))}
        </div>
    );
};
