import React from 'react';
import { Button } from 'semantic-ui-react';
import { View, Trigger } from '@memento/react';
import store, {
  hasText,
  isConnected,
  sendChatMessage,
  getText,
  getUsername,
} from './store';

const Send = () => (
  <View
    store={store}
    isConnected={isConnected}
    text={getText}
    username={getUsername}
    compute={({ username, text, isConnected, hasInputMessage }) => ({
      disabled: text.length === 0 || !isConnected,
      text,
      username,
    })}
  >
    {({ disabled, text, username }) => (
      <Trigger store={store} onClick={sendChatMessage(username, text)}>
        {({ onClick }) => (
          <Button
            disabled={disabled}
            onClick={onClick}
            color="teal"
            icon="send"
            content="Send"
            labelPosition="left"
          />
        )}
      </Trigger>
    )}
  </View>
);

export default Send;
