import { useAuth } from '@/context/AuthContext';
import classes from './navbar-user-dropdown.module.scss';
import { Avatar, Button, Divider, Dropdown, MenuProps, Typography } from 'antd';
import { getPictureSrcUrl } from '@/utils/picture.utils';
import { EditOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

export interface NavbarUserDropdownProps {
    showModal: () => void;
    showPreferencesModal: () => void;
}

const { Text } = Typography;

export const NavbarUserDropdown = ({ showModal, showPreferencesModal }: NavbarUserDropdownProps) => {
    const { loggedInUser, logout } = useAuth();

    const items: MenuProps['items'] = [
        {
            key: 'profile',
            label: loggedInUser ? (
                <div className={classes.dropdownContainer}>
                    <div className={classes.profileImageContainer}>
                        <Avatar 
                            className={classes.profileImage}
                            src={getPictureSrcUrl(loggedInUser?.picture)}
                            icon={<UserOutlined />}
                        />
                    </div>

                    <div className={classes.textCenter}>
                        <Text className={classes.profileName}>{loggedInUser.username}</Text>
                        <Text className={classes.profileEmail}>{loggedInUser.email}</Text>
                    </div>

                    <div className={classes.textCenter}>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            className={classes.customizeProfileButton}
                            onClick={showModal}
                        >
                            Edit User
                        </Button>

                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            className={classes.customizeProfileButton}
                            onClick={showPreferencesModal}
                        >
                            Edit Preferences
                        </Button>
                    </div>

                    <Divider className={classes.divider} />

                    <Button
                        type="primary"
                        onClick={logout}
                        danger
                        icon={<LogoutOutlined />}
                        className={classes.logoutButton}
                    >
                        Log Out
                    </Button>
                </div>
            ) : null,
        },
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            {loggedInUser && (
                <Avatar 
                    src={getPictureSrcUrl(loggedInUser.picture)}
                    icon={<UserOutlined />}
                    className={classes.avatarSmall}
                />
            )}
        </Dropdown>
    );
};
