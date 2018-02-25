import React from 'react';
import { Divider, Comment, Segment, Header, Icon } from 'semantic-ui-react';
import Message from './Message';
import { View } from '@memento/react';
import store, { getMessages } from './store';

const Messages = () => (
  <View store={store} messages={getMessages}>
    {({ messages }) => (
      <Segment>
        {messages.size === 0 && (
          <Header as="h4" icon textAlign="center" disabled>
            <Divider hidden />
            <Icon name="info" />
            No Messages
            <Header.Subheader>
              No messages found. Connect and write some!
            </Header.Subheader>
          </Header>
        )}
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
