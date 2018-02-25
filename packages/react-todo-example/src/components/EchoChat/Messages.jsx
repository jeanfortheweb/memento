import React from 'react';
import { Comment, Segment } from 'semantic-ui-react';
import Message from './Message';
import { View } from '@memento/react';
import store, { getMessages } from './store';

const Messages = () => (
  <View store={store} messages={getMessages}>
    {({ messages }) => (
      <Segment>
        <Comment.Group>
          {messages.map(message => (
            <Message key={message.date.toLocaleString()} message={message} />
          ))}
        </Comment.Group>
      </Segment>
    )}
  </View>
);

export default Messages;
