import { useEffect, useState } from 'react';
import classes from './navbar.module.scss';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

import { EditProfileModal } from '../EditProfileModal';
import { NavbarUserDropdown } from '../NavbarUserDropdown';
import { ROUTES } from '@/constants/routes.const';
import { Modal } from 'antd';
import PreferencesBody from '@/pages/UserPreferences/PreferencesBody';
import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
    const { loggedInUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);

    const showModal = () => setIsModalOpen(true);
    const showPreferencesModal = () => setIsPreferencesModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);
    const handlePreferencesCancel = () => setIsPreferencesModalOpen(false);

    useEffect(() => {
        console.log('homo');
        console.log(loggedInUser?.isFirstVisit);
        if (loggedInUser?.isFirstVisit) {
            showPreferencesModal();
        }
    }, []);

    return (
        <nav className={classes.navbar}>
            <Link to={ROUTES.HOME} className={classes.brand}>
                <FontAwesomeIcon icon={faFutbol} />
                <h1 className={classes.title}>Sport Scanner</h1>
            </Link>

            <div className={classes.right}>
                <div className={classes.navLinks}>
                    <Link to={ROUTES.HISTORY}>History</Link>
                </div>
                <div className={classes.navLinks}>
                    <Link to={ROUTES.SAVED_PACKAGES}>Saved</Link>
                </div>

                <NavbarUserDropdown showModal={showModal} showPreferencesModal={showPreferencesModal} />

                <EditProfileModal isOpen={isModalOpen} handleCancel={handleCancel} />

                <Modal
                    open={isPreferencesModalOpen}
                    onCancel={handlePreferencesCancel}
                    footer={null}
                    centered
                    width={700}
                    destroyOnClose
                    title="Edit Preferences"
                >
                    <PreferencesBody handlePreferencesCancel={handlePreferencesCancel}/>
                </Modal>
            </div>
        </nav>
    );
};
