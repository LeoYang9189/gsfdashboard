import React from 'react';
import { Layout, theme } from 'antd';
import './App.css';
import Dashboard from './Dashboard';

const { Content } = Layout;

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="app-container">
      <Layout>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Dashboard />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App; 