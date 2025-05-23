import SearchBar from '../../components/SearchBar/SearchBar';
import GroupDetailsPage from '../GroupDetailsPage/GroupDetailsPage';
import classes from './home-screen.module.scss';

const HomeScreen = () => {
    return (
        <div className={classes.container}>
            {/* <SearchBar /> */}
            <GroupDetailsPage />
        </div>
    );
};

export default HomeScreen;
