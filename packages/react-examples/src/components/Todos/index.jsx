import React from 'react';
import { Divider, Segment, Button, List } from 'semantic-ui-react';
import { View, Trigger } from '@memento/react';
import store, { getTodos, saveTodos, getFilter } from './store';
import Header from './Header';
import Footer from './Footer';
import Item from './Item';

const Todos = () => (
  <Segment.Group>
    <Segment secondary>
      <Header />
    </Segment>
    <Segment>
      <List divided color="teal" relaxed="very" selection>
        <View store={store} filter={state => state.filter}>
          {({ filter }) => (
            <View
              store={store}
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

export default Todos;
