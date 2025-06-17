import React from 'react';
import './styles/GroupHeader.scss';
import { PopulatedGroup } from '@/models/group.model.ts';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';
import { GroupService } from '@/api/services/group.service';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import classes from '@pages/GroupsScreen/groups-screen.module.scss';
import { formattedDate } from '@/utils/date.utils.ts';
import { Calendar, CircleDollarSignIcon } from 'lucide-react';

interface Props {
    group: PopulatedGroup;
}

export const MAX_AVATAR_DISPLAY_LENGTH = 5;

const getUserAvatarDisplayName = (username: string) => {
    return username.split(' ')[0];
};

const GroupHeader: React.FC<Props> = ({ group }) => {
    const navigate = useNavigate();
    const { users, title, _id } = group;

    const handleDeleteGroup = async () => {
        await GroupService.delete(_id);
        navigate(ROUTES.GROUPS);
    };

    return (
        <div className="group-header-box">
            <div className="top-row">
                <div className="left">
                    <h2>{title}</h2>
                    <span className="members-label">Members ({users.length})</span>
                    <div className="avatars">
                        {users.map((user) => (
                            <div key={user._id} className="avatar-block">
                                <img src={user.picture} alt={user.username} />
                                <span>{getUserAvatarDisplayName(user.username)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="right">
                    <div className="info">
                        <div className="header-details">
                            <CircleDollarSignIcon className={'group-header-icon'} />
                            <span className="text">up to ${group.maxBudget}</span>
                        </div>
                        <div className="header-details">
                            <Calendar className={'group-header-icon'} />
                            <span className="text">
                                {formattedDate(group.dates.start)} → {formattedDate(group.dates.end)}
                            </span>
                        </div>
                    </div>
                    <div className="group-actions-row">
                        <button onClick={() => navigate(`${ROUTES.EDIT_GROUP}/${_id}`)} className={classes.addButton}>
                            <EditOutlined />
                            Edit Group
                        </button>
                        <button onClick={handleDeleteGroup} className={classes.deleteButton}>
                            <DeleteOutlined />
                            Delete Group
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupHeader;
