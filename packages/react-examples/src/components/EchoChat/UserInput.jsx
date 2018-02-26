import React from 'react';
import { View, Trigger } from '@memento/react';
import { Input } from 'semantic-ui-react';
import Connect from './Connect';
import store, { isConnected, setUsername, getUsername } from './store';

const UserInput = () => (
  <Trigger store={store} onChange={setUsername}>
    {({ onChange }) => (
      <View store={store} value={getUsername}>
        {({ value }) => (
          <Input
            value={value}
            onChange={onChange}
            placeholder="Insert your username..."
            action={<Connect />}
          />
        )}
      </View>
    )}
  </Trigger>
);

export default UserInput;
