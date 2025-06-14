import SearchBar from '../../components/SearchBar/SearchBar';
import classes from './home-screen.module.scss';
import { UserSuggestedPackages } from '@components/UserSuggestedPackages';

const HomeScreen = () => {
    return (
        <div className={classes.container}>
            <div className={classes.searchBarContainer}>
                <SearchBar />
            </div>

            <div className={classes.userSuggestedPackagesContainer}>
                <UserSuggestedPackages />
            </div>
        </div>
    );
};

export default HomeScreen;
