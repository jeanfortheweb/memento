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
        <Message icon info>
          <Icon name="info" />
          <Message.Content>
            <Message.Header>Render Performance</Message.Header>
            <p>
              Please note that this example is unoptimized in terms of render
              performance. Almost the whole visible ui is getting rendered again
              when the count changes.
            </p>
            <p>
              Open your dev tools and enable <b>"Highlight Updates"</b> on your
              react dev tools to see this in action.
            </p>
            <p>
              To see how you can optimize views for both - usage and performance
              - checkout the other examples.
            </p>
          </Message.Content>
        </Message>

        <Counter.View>
          {(actions, count) => (
            <div>
              <Header
                icon="info circle"
                attached="top"
                content="Memento by Example | Counter"
              />
              <Segment attached>
                <Header as="h5">Current Count: {count}</Header>
              </Segment>
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
            </div>
          )}
        </Counter.View>
      </Grid.Column>
    </Grid>
  </Container>,
  document.getElementById('app'),
);
