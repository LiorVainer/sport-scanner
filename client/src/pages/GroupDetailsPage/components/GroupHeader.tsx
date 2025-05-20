import React from 'react';
import './styles/GroupHeader.scss';
import { PublicUser } from '@/models/user.model';
import { Package } from '@/models/packages/package.model';

interface Props {
    title: string;
    users: PublicUser[];
    selectedPackage: Package;
}

const GroupHeader: React.FC<Props> = ({ title, users, selectedPackage }) => {
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
                    <div className="info-row">
                        <span className="icon">💰</span>
                        <span className="text">
                            €{selectedPackage.totalPrice.min} - €{selectedPackage.totalPrice.max}
                        </span>
                        <span className="icon">📅</span>
                        <span className="text">
                            {selectedPackage.startDate} → {selectedPackage.endDate}
                        </span>
                    </div>
                    <div className="add-members-row">
                        <button className="add-btn">👥 Add Members</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupHeader;
