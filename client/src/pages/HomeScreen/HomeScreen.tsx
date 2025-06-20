import SearchBar from '../../components/SearchBar/SearchBar';
import classes from './home-screen.module.scss';
import { UserSuggestedPackages } from '@components/UserSuggestedPackages';
import { Screen } from '@components/Screen';

const HomeScreen = () => {
    return (
        <Screen className={classes.container}>
            <div className={classes.searchBarContainer}>
                <SearchBar />
            </div>

            <div className={classes.userSuggestedPackagesContainer}>
                <UserSuggestedPackages />
            </div>
        </Screen>
    );
};

export default HomeScreen;
