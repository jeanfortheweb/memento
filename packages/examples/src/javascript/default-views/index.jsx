import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import {
  Container,
  Button,
  Segment,
  Header,
  Divider,
  Grid,
  Icon,
  Message,
} from 'semantic-ui-react';
import counter from './models/counter';

const Counter = counter();

ReactDOM.render(
  <Container>
    <Grid centered>
      <Grid.Column width={8}>
        <Divider hidden />
        <Message icon success>
          <Icon name="checkmark" />
          <Message.Content>
            <Message.Header>Render Performance</Message.Header>
            <p>
              This time, we make use of the other default views we have availble
              to split our rendering into actions and actual data.
            </p>
            <p>
              Open your dev tools and enable <b>"Highlight Updates"</b> on your
              react dev tools to see this in action.
            </p>
            <p>
              Using this simple optimization we have made our rendering much
              more efficient.
            </p>
          </Message.Content>
        </Message>

        <Header
          icon="info circle"
          attached="top"
          content="Memento by Example | Counter"
        />
        <Segment attached>
          <Header as="h5">
            Current Count:{' '}
            <Counter.DataView>
              {(actions, count) => <span>{count}</span>}
            </Counter.DataView>
          </Header>
        </Segment>
        <Counter.ActionView>
          {actions => (
            <Button.Group attached="bottom" fluid>
              <Button
                labelPosition="left"
                icon="arrow up"
                content="Increment"
                onClick={actions.increment}
              />
              <Button
                labelPosition="left"
                icon="arrow down"
                content="Decrement"
                onClick={actions.decrement}
              />
            </Button.Group>
          )}
        </Counter.ActionView>
      </Grid.Column>
    </Grid>
  </Container>,
  document.getElementById('app'),
);
