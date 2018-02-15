import React from 'react';
import { List } from 'antd';
import { View } from '@memento/react';
import todoStore, { getTodos } from '../../stores/todo';
import settingsStore, { getFilter } from '../../stores/settings';
import Footer from './Footer';
import Item from './Item';

const TodoList = () => (
  <List header={<div>Todos</div>} footer={<Footer />} bordered>
    <View store={settingsStore} filter={state => state.filter}>
      {({ filter }) => (
        <View
          store={todoStore}
          filter={filter}
          todos={state => state.todos}
          compute={props =>
            props.todos.filter(
              todo =>
                props.filter === 'ALL' ||
                (props.filter === 'DONE' && todo.done) ||
                (props.filter === 'PENDING' && !todo.done),
            )
          }
        >
          {todos => todos.map(todo => <Item key={todo.id} data={todo} />)}
        </View>
      )}
    </View>
  </List>
);

export default TodoList;
