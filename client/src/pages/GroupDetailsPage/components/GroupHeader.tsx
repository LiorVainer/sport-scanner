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
import { UserAvatarWithFavorites } from '@/components/UserAvatarWithFavorites';

export const MAX_AVATAR_DISPLAY_LENGTH = 5;

interface Props {
    group: PopulatedGroup;
}

const GroupHeader: React.FC<Props> = ({ group }) => {
    const navigate = useNavigate();
    const { users, title, _id, maxBudget, dates } = group;

    const handleDeleteGroup = async () => {
        try {
            await GroupService.delete(_id);
            navigate(ROUTES.GROUPS);
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    const displayedUsers = users.slice(0, MAX_AVATAR_DISPLAY_LENGTH);
    const remainingUsersCount = users.length - MAX_AVATAR_DISPLAY_LENGTH;

    return (
        <div className="group-header-box">
            <div className="top-row">
                <div className="left">
                    <h2>{title}</h2>
                    <div className="members-label">
                        Members ({users.length})
                    </div>
                    <div className="avatars">
                        {displayedUsers.map((user) => (
                            <UserAvatarWithFavorites
                                key={user._id}
                                user={user}
                                size={36}
                                showName={true}
                            />
                        ))}
                        {remainingUsersCount > 0 && (
                            <div className="add-avatar">
                                +{remainingUsersCount}
                            </div>
                        )}
                    </div>
                </div>
                <div className="right">
                    <div className="info">
                        <div className="header-details">
                            <CircleDollarSignIcon className="icon" size={16} />
                            <span className="text">up to ${maxBudget}</span>
                        </div>
                        <div className="header-details">
                            <Calendar className="icon" size={16} />
                            <span className="text">
                                {formattedDate(dates.start)} → {formattedDate(dates.end)}
                            </span>
                        </div>
                    </div>
                    <div className="group-actions-row">
                        <button
                            onClick={() => navigate(`${ROUTES.EDIT_GROUP}/${_id}`)}
                            className={classes.addButton}
                        >
                            <EditOutlined />
                            Edit Group
                        </button>
                        <button
                            onClick={handleDeleteGroup}
                            className={classes.deleteButton}
                        >
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
