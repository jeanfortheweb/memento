import React from 'react';
import { Container, Divider, Grid, Menu } from 'semantic-ui-react';
import AppMenu from './AppMenu';
import Todos from './Todos';
import EchoChat from './EchoChat';
import { View } from '@memento/react';
import store, { getActive } from './store';

const renderActive = ({ active }) => {
  switch (active) {
    case 'Todos':
      return <Todos />;

    case 'Echo Chat':
      return <EchoChat />;

    default:
      return `Unkown Example: ${active}`;
  }
};
const App = () => (
  <Container>
    <Divider hidden />
    <Grid centered>
      <Grid.Column width={3}>
        <AppMenu />
      </Grid.Column>
      <Grid.Column width={9}>
        <View store={store} active={getActive} render={renderActive} />
      </Grid.Column>
    </Grid>
  </Container>
);

export default App;
