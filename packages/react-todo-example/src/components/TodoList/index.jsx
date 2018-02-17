import React from 'react';
import { Segment, Button, List } from 'semantic-ui-react';
import { View, Trigger } from '@memento/react';
import todoStore, { getTodos, saveTodos } from '../../stores/todo';
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
      <List divided color="teal" relaxed="very" selection>
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
      <View store={todoStore} todos={getTodos}>
        {({ todos }) => (
          <Trigger store={todoStore} onClick={saveTodos(todos)}>
            {({ onClick }) => <Button icon="save" content="Save" onClick={onClick} />}
          </Trigger>
        )}
      </View>
    </Segment>
  </Segment.Group>
);

export default TodoList;
