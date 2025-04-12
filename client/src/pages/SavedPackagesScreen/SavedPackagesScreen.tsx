import React from 'react';
import { ROUTES } from '@/constants/routes.const';
import { NoSavedPackages } from './NoSavedPackages';
import { UsersService } from '@/api/services/users.service';
import { UserPackagesScreen } from '../UserPackagesScreen/UserPackagesScreen';

export const SavedPackagesScreen = () => {
    return (
        <UserPackagesScreen
            queryKey={['usersSavedPackages']}
            queryFn={() => UsersService.getUsersSavedPackages()}
            emptyComponent={<NoSavedPackages />}
            backRoute={`/${ROUTES.SAVED_PACKAGES.replace(/^\/+/, '')}`}
        />
    );
};
