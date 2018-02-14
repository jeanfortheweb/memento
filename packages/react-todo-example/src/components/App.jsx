import React from 'react';
import { Layout, Row, Col, List } from 'antd';
import TodoList from './TodoList';

const data = ['a', 'b'];

const App = () => (
  <Layout style={{ height: '100vh' }}>
    <Layout.Content style={{ padding: 24 }}>
      <Row type="flex" align="middle">
        <Col span={12} offset={6}>
          <TodoList />
        </Col>
      </Row>
    </Layout.Content>
  </Layout>
);

export default App;
