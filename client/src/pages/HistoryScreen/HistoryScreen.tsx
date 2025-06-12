import { ROUTES } from '@/constants/routes.const';
import { UsersService } from '@/api/services/users.service';
import { NoHistory } from './NoHistory';
import { UserPackagesScreen } from '../UserPackagesScreen/UserPackagesScreen';

export const HistoryScreen = () => {
    return (
        <UserPackagesScreen
            title={'Packages Seen History'}
            queryKey={['usersHistory']}
            queryFn={UsersService.getUsersHistory}
            emptyComponent={<NoHistory />}
            backRoute={`/${ROUTES.HISTORY.replace(/^\/+/, '')}`}
        />
    );
};
