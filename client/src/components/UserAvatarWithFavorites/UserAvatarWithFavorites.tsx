import React from 'react';
import { Avatar, Popover, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PublicUser } from '@/models/user.model';
import { getPictureSrcUrl } from '@/utils/picture.utils';
import styles from './user-avatar-with-favorites.module.scss';

const { Text } = Typography;

interface UserAvatarWithFavoritesProps {
    user: PublicUser;
    size?: number;
    showName?: boolean;
    className?: string;
}

const FavoriteTeamsContent: React.FC<{ user: PublicUser }> = ({ user }) => {
    if (!user.favoriteTeams || user.favoriteTeams.length === 0) {
        return (
            <div className={styles.noFavorites}>
                <Text type="secondary">No favorite teams selected</Text>
            </div>
        );
    }

    return (
        <div className={styles.favoriteTeamsContainer}>
            <div className={styles.teamsGrid}>
                {user.favoriteTeams.map((team) => (
                    <div key={team.id} className={styles.teamItem}>
                        <img src={team.logo} alt={team.name} className={styles.teamLogo} />
                        <Text className={styles.teamName}>{team.name}</Text>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const UserAvatarWithFavorites: React.FC<UserAvatarWithFavoritesProps> = ({
    user,
    size = 36,
    showName = true,
    className,
}) => {
    const displayName = user.username.split(' ')[0];

    return (
        <div className={`${styles.avatarBlock} ${className || ''}`}>
            <Popover
                content={<FavoriteTeamsContent user={user} />}
                trigger="hover"
                placement="top"
                title={user.username}
                overlayClassName={styles.favoriteTeamsPopover}
            >
                <Avatar
                    src={getPictureSrcUrl(user.picture)}
                    icon={<UserOutlined />}
                    size={size}
                    className={styles.avatar}
                />
            </Popover>
            {showName && <span className={styles.displayName}>{displayName}</span>}
        </div>
    );
};
