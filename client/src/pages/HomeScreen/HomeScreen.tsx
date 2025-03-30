import SearchBar from '../../components/SearchBar/SearchBar';

const HomeScreen = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ margin: '0 auto', padding: '40px 16px' }}>
        <SearchBar />
      </div>
    </div>
  );
};

export default HomeScreen;