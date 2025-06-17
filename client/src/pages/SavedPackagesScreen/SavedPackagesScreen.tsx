import { ROUTES } from '@/constants/routes.const';
import { NoSavedPackages } from './NoSavedPackages';
import { UsersService } from '@/api/services/users.service';
import { UserPackagesScreen } from '../UserPackagesScreen/UserPackagesScreen';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const SavedPackagesScreen = () => {
    return (
        <UserPackagesScreen
            title={'Saved Packages'}
            queryKey={['usersSavedPackages']}
            queryFn={() => UsersService.getUsersSavedPackages()}
            emptyComponent={<NoSavedPackages />}
            backRoute={`/${ROUTES.SAVED_PACKAGES.replace(/^\/+/, '')}`}
            titleIcon={<FontAwesomeIcon icon={faBookmark} />}
        />
    );
};
