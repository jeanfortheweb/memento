import React from 'react';
import { Segment, Input } from 'semantic-ui-react';
import Send from './Send';
import { Trigger, View } from '@memento/react';
import store, { getText, setText } from './store';

const TextInput = ({ value }) => (
  <Trigger store={store} onChange={setText}>
    {({ onChange }) => (
      <Input
        fluid
        value={value}
        onChange={onChange}
        placeholder="Enter chat message..."
        action={<Send />}
      />
    )}
  </Trigger>
);

const Footer = () => (
  <Segment secondary>
    <View store={store} value={getText} render={TextInput} />
  </Segment>
);

export default Footer;
