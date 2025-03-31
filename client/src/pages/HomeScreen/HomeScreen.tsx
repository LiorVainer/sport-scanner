import SearchBar from '../../components/SearchBar/SearchBar';
import classes from './home-screen.module.scss';

const HomeScreen = () => {
    return (
        <div className={classes.container}>
            <div className={classes.searchBarDiv}>
                <SearchBar/>
            </div>
        </div>
    );
};

export default HomeScreen;