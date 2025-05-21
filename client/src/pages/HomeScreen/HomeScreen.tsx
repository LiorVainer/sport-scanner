import SearchBar from '../../components/SearchBar/SearchBar';
import classes from './home-screen.module.scss';
import { useQuery } from '@tanstack/react-query';
import { UserSuggestedPackages } from '@components/UserSuggestedPackages';
import { UsersService } from '@api/services/users.service.ts';

const HomeScreen = () => {
    const { data: userSuggestedPackages = [] } = useQuery({
        queryKey: ['users', 'suggestedPackages'],
        queryFn: () => UsersService.getUsersSuggestedPackages(),
    });

    return (
        <div className={classes.container}>
            <div className={classes.searchBarContainer}>
                <SearchBar />
            </div>

            <div className={classes.userSuggestedPackagesContainer}>
                <UserSuggestedPackages userSuggestedPackages={userSuggestedPackages} />
            </div>
        </div>
    );
};

export default HomeScreen;
