import { ROUTES } from '@/constants/routes.const';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';
import classes from './groups-screen.module.scss';

export const GroupsScreen = () => {
    const navigate = useNavigate();

    const handleNewGroup = () => {
        navigate(ROUTES.ADD_GROUP);
    };

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Groups</h1>
            <Button
                icon={<EditOutlined />}
                type="primary"
                onClick={handleNewGroup}
                className={classes.newGroupButton}
            >
                Create New Group
            </Button>
        </div>
    );
};
