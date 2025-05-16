import SearchBar from '../../components/SearchBar/SearchBar';
import classes from './home-screen.module.scss';
import { useQuery } from '@tanstack/react-query';
import { UsersService } from '@api/services/users.service.ts';
import { UserSuggestedPackages } from '@components/UserSuggestedPackages';

const HomeScreen = () => {
    const { data: userSuggestedPackages } = useQuery({
        queryKey: ['users', 'suggestedPackages'],
        queryFn: () => UsersService.getUsersSuggestedPackages(),
    });

    return (
        <div className={classes.container}>
            <div className={classes.searchBarContainer}>
                <SearchBar />
            </div>
            {userSuggestedPackages && userSuggestedPackages.length > 0 && (
                <div className={classes.userSuggestedPackagesContainer}>
                    <UserSuggestedPackages userSuggestedPackages={userSuggestedPackages} />
                </div>
            )}
        </div>
    );
};

export default HomeScreen;
