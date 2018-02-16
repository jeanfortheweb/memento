import React from 'react';
import { View, Trigger } from '@memento/react';
import { Grid, Label, Header as SemanticHeader } from 'semantic-ui-react';
import todoStore from '../../stores/todo';
import settingsStore, { setFilter } from '../../stores/settings';

const StatLabel = ({ name, value }) => (
  <Trigger store={settingsStore} onClick={setFilter(name.toUpperCase())}>
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
    store={todoStore}
    todos={state => state.todos}
    compute={({ todos }) => ({
      total: todos.size,
      pending: todos.filter(todo => !todo.done).size,
      done: todos.filter(todo => todo.done).size,
    })}
  >
    {({ total, done, pending }) => (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <SemanticHeader content="Todos" subheader="A memento example" />
          </Grid.Column>
          <Grid.Column width={8} textAlign="right" verticalAlign="middle">
            <StatLabel name="All" value={total} />
            <StatLabel name="Pending" value={pending} />
            <StatLabel name="Done" value={done} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )}
  </View>
);

export default Header;
