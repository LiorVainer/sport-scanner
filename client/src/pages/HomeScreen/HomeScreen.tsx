import React from 'react';
import { Layout } from 'antd';
import SearchBar from '../../components/SearchBar/SearchBar';

const { Content } = Layout;

const HomeScreen: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
        <SearchBar />
      </Content>
    </Layout>
  );
};

export default HomeScreen;