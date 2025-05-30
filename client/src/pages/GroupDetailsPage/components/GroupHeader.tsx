import React from 'react';
import './styles/GroupHeader.scss';
import { Group, PopulatedGroup } from '@/models/group.model.ts';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';
import { GroupService } from '@/api/services/group.service';

interface Props {
    group: PopulatedGroup;
}

const GroupHeader: React.FC<Props> = ({ group }) => {
    const navigate = useNavigate();
    const { users, selectedPackage, title, _id } = group;

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
                                <span>{user.username}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="right">
                    {selectedPackage && (
                        <div className="info-row">
                            <span className="icon">💰</span>
                            <span className="text">
                                €{selectedPackage?.totalPrice.min} - €{selectedPackage?.totalPrice.max}
                            </span>
                            <span className="icon">📅</span>
                            <span className="text">
                                {selectedPackage?.startDate} → {selectedPackage?.endDate}
                            </span>
                        </div>
                    )}
                    <div className="group-actions-row">
                        <button onClick={handleDeleteGroup} className="delete-btn">
                            🗑️ Delete Group
                        </button>
                        <button onClick={() => navigate(`${ROUTES.EDIT_GROUP}/${_id}`)} className="edit-btn">
                            ✏️ Edit Group Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupHeader;
