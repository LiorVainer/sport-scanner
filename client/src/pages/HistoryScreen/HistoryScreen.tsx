import { ROUTES } from '@/constants/routes.const';
import { UsersService } from '@/api/services/users.service';
import { NoHistory } from './NoHistory';
import { UserPackagesScreen } from '../UserPackagesScreen/UserPackagesScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

export const HistoryScreen = () => {
    return (
        <UserPackagesScreen
            title={'Packages Seen History'}
            queryKey={['usersHistory']}
            queryFn={UsersService.getUsersHistory}
            emptyComponent={<NoHistory />}
            backRoute={`/${ROUTES.HISTORY.replace(/^\/+/, '')}`}
            titleIcon={<FontAwesomeIcon icon={faClockRotateLeft} />}
        />
    );
};
