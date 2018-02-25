import React from 'react';
import {
  Header as SemanticHeader,
  Grid,
  Input,
  Button,
  Segment,
} from 'semantic-ui-react';
import UserInput from './UserInput';

const Header = () => (
  <Segment secondary clearing>
    <Grid>
      <Grid.Column width={6}>
        <SemanticHeader content="Echo Chat" subheader="A memento example" />
      </Grid.Column>
      <Grid.Column width={10} textAlign="right">
        <UserInput />
      </Grid.Column>
    </Grid>
  </Segment>
);

export default Header;
