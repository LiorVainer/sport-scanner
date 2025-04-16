import SearchBar from '../../components/SearchBar/SearchBar';
import classes from './home-screen.module.scss';

const HomeScreen = () => {
    return (
        <div className={classes.container}>
            <SearchBar />
        </div>
    );
};

export default HomeScreen;
