import React from 'react';
import { Segment, List } from 'semantic-ui-react';
import { View } from '@memento/react';
import todoStore, { getTodos } from '../../stores/todo';
import settingsStore, { getFilter } from '../../stores/settings';
import Header from './Header';
import Footer from './Footer';
import Item from './Item';

const TodoList = () => (
  <Segment.Group>
    <Segment secondary>
      <Header />
    </Segment>
    <Segment>
      <List divided>
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
    </Segment>
    <Segment secondary>
      <Footer />
    </Segment>
  </Segment.Group>
);

export default TodoList;
