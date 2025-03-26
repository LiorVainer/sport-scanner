import { useAuth } from '@/context/AuthContext';
import classes from './navbar-user-dropdown.module.scss';
import { Button, Divider, Dropdown, MenuProps, Typography } from 'antd';
import { getPictureSrcUrl } from '@/utils/picture.utils';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';

export interface NavbarUserDropdownProps {
    showModal: () => void;
}

const { Text } = Typography;

export const NavbarUserDropdown = ({ showModal }: NavbarUserDropdownProps) => {
    const { loggedInUser, logout } = useAuth();

    const items: MenuProps['items'] = [
        {
            key: 'profile',
            label: loggedInUser ? (
                <div className={classes.dropdownContainer}>
                    <div className={classes.profileImageContainer}>
                        <img
                            src={getPictureSrcUrl(loggedInUser?.picture)}
                            alt="User Avatar"
                            className={classes.profileImage}
                        />
                    </div>

                    <div className={classes.textCenter}>
                        <Text className={classes.profileName}>{loggedInUser.username}</Text>
                        <Text className={classes.profileEmail}>{loggedInUser.email}</Text>
                    </div>

                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        className={classes.customizeProfileButton}
                        onClick={showModal}
                    >
                        Edit User
                    </Button>

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
                <img src={getPictureSrcUrl(loggedInUser.picture)} alt="User Avatar" className={classes.avatarSmall} />
            )}
        </Dropdown>
    );
};
