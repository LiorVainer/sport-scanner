import { useState } from 'react';
import classes from './navbar.module.scss';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

import { EditProfileModal } from '../EditProfileModal';
import { NavbarUserDropdown } from '../NavbarUserDropdown';
import { ROUTES } from '@/constants/routes.const';

export const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

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
                <NavbarUserDropdown showModal={showModal} />
                <EditProfileModal isOpen={isModalOpen} handleCancel={handleCancel} />
            </div>
        </nav>
    );
};
