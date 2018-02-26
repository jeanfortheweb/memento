import React from 'react';
import { View, Trigger } from '@memento/react';
import { Grid, Label, Header as SemanticHeader } from 'semantic-ui-react';
import store, { setFilter } from './store';

const StatLabel = ({ name, value }) => (
  <Trigger store={store} onClick={setFilter(name)}>
    {({ onClick }) => (
      <Label as="a" color="teal" onClick={onClick}>
        {name}
        <Label.Detail>{value}</Label.Detail>
      </Label>
    )}
  </Trigger>
);

const Header = () => (
  <View
    store={store}
    todos={state => state.todos}
    compute={({ todos }) => ({
      all: todos.size,
      pending: todos.filter(todo => !todo.done).size,
      done: todos.filter(todo => todo.done).size,
    })}
  >
    {({ all, done, pending }) => (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <SemanticHeader content="Todos" subheader="A memento example" />
          </Grid.Column>
          <Grid.Column width={8} textAlign="right" verticalAlign="middle">
            <StatLabel name="All" value={all} />
            <StatLabel name="Pending" value={pending} />
            <StatLabel name="Done" value={done} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )}
  </View>
);

export default Header;
