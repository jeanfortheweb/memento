import React from 'react';
import { Container, Divider, Grid } from 'semantic-ui-react';
import TodoList from './TodoList';
import EchoChat from './EchoChat';

const data = ['a', 'b'];

const App = () => (
  <Container>
    <Divider hidden />
    <Grid centered>
      <Grid.Column width={9}>
        <TodoList />
        <EchoChat />
      </Grid.Column>
    </Grid>
  </Container>
);

export default App;
