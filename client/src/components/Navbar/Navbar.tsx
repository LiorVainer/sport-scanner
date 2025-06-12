import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'antd';
import clsx from 'clsx';
import classes from './navbar.module.scss';

import { EditProfileModal } from '../EditProfileModal';
import { NavbarUserDropdown } from '../NavbarUserDropdown';
import PreferencesBody from '@/pages/UserPreferences/PreferencesBody';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes.const';

export const Navbar: React.FC = () => {
    const { loggedInUser } = useAuth();
    const { pathname } = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

    const showModal = () => setIsModalOpen(true);
    const showPreferencesModal = () => setIsPreferencesModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);
    const handlePreferencesCancel = () => setIsPreferencesModalOpen(false);

    useEffect(() => {
        if (loggedInUser?.isFirstVisit) {
            showPreferencesModal();
        }
    }, [loggedInUser]);

    return (
        <nav className={classes.navbar}>
            <Link to={ROUTES.HOME} className={classes.brand}>
                <FontAwesomeIcon icon={faFutbol} />
                <h1 className={classes.title}>Sport Scanner</h1>
            </Link>

            <div className={classes.right}>
                <Link
                    to={ROUTES.GROUPS}
                    className={clsx(classes.navLinks, {
                        [classes.activeLink]: pathname.includes(ROUTES.GROUPS),
                    })}
                >
                    Groups
                </Link>

                <Link
                    to={ROUTES.HISTORY}
                    className={clsx(classes.navLinks, {
                        [classes.activeLink]: pathname.includes(ROUTES.HISTORY),
                    })}
                >
                    History
                </Link>

                <Link
                    to={ROUTES.SAVED_PACKAGES}
                    className={clsx(classes.navLinks, {
                        [classes.activeLink]: pathname.includes(ROUTES.SAVED_PACKAGES),
                    })}
                >
                    Saved
                </Link>

                <NavbarUserDropdown showModal={showModal} showPreferencesModal={showPreferencesModal} />
                <EditProfileModal isOpen={isModalOpen} handleCancel={handleCancel} />

                <Modal
                    open={isPreferencesModalOpen}
                    onCancel={handlePreferencesCancel}
                    footer={null}
                    centered
                    width={700}
                    className={classes.preferencesModal}
                    destroyOnClose
                >
                    <PreferencesBody
                        isFirstVisit={loggedInUser?.isFirstVisit}
                        handlePreferencesCancel={handlePreferencesCancel}
                    />
                </Modal>
            </div>
        </nav>
    );
};
