import React from 'react';
import { Button } from 'semantic-ui-react';
import { View, Trigger } from '@memento/react';
import store, {
  connectToChat,
  isConnected,
  disconnectFromChat,
  getUsername,
} from './store';

const Connect = () => (
  <Trigger store={store} onConnect={connectToChat} onDisconnect={disconnectFromChat}>
    {({ onConnect, onDisconnect }) => (
      <View store={store} username={getUsername} isConnected={isConnected}>
        {({ username, isConnected }) => (
          <Button
            disabled={username.length === 0}
            onClick={isConnected ? onDisconnect : onConnect}
            color="teal"
            icon="world"
            content={isConnected ? 'Disconnect' : 'Connect'}
            labelPosition="left"
          />
        )}
      </View>
    )}
  </Trigger>
);

export default Connect;
