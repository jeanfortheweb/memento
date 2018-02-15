import React from 'react';
import { List } from 'antd';
import { View } from '@memento/react';
import todoStore, { getTodos } from '../../stores/todo';
import settingsStore, { getFilter } from '../../stores/settings';
import Footer from './Footer';
import Item from './Item';

const TodoList = () => (
  <List header={<div>Todos</div>} footer={<Footer />} bordered>
    <View store={settingsStore} selector={getFilter}>
      {filter => (
        <View store={todoStore} selector={getTodos(filter)}>
          {list => list.map(todo => <Item key={todo.id} data={todo} />)}
        </View>
      )}
    </View>
  </List>
);

export default TodoList;
