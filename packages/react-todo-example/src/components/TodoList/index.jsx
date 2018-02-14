import React from 'react';
import { List } from 'antd';
import { View } from '@memento/react';
import todoStore, { getTodos } from '../../stores/todo';

const TodoList = () => (
  <View store={todoStore} selector={getTodos}>
    {list => (
      <List
        header={<div>Header</div>}
        footer={<div>Footer</div>}
        bordered
        dataSource={list.toJS()}
        renderItem={item => <List.Item>{item.text}</List.Item>}
      />
    )}
  </View>
);

export default TodoList;
