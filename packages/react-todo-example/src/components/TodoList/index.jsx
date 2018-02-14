import React from 'react';
import { List } from 'antd';
import { View } from '@memento/react';
import todoStore, { getTodos } from '../../stores/todo';
import Footer from './Footer';
import Item from './Item';

const TodoList = () => (
  <View store={todoStore} selector={getTodos}>
    {list => (
      <List
        header={<div>Header</div>}
        footer={<Footer />}
        bordered
        dataSource={list.toJS()}
        renderItem={item => <Item data={item} />}
      />
    )}
  </View>
);

export default TodoList;
