import React from 'react';
import { ROUTES } from '@/constants/routes.const';
import { UsersService } from '@/api/services/users.service';
import { NoHistory } from './NoHistory';
import { UserPackagesScreen } from '../UserPackagesScreen/UserPackagesScreen';

export const HistoryScreen = () => {
    return (
        <UserPackagesScreen
            queryKey={['usersHistory']}
            queryFn={UsersService.getUsersHistory}
            emptyComponent={<NoHistory />}
            backRoute={`/${ROUTES.HISTORY.replace(/^\/+/, '')}`}
        />
    );
};
