import React from 'react';
import { Comment } from 'semantic-ui-react';
import moment from 'moment';

const Message = ({ message: { date, username, text } }) => (
  <Comment>
    <Comment.Content>
      <Comment.Author as="a">{username}</Comment.Author>
      <Comment.Metadata>
        <div>{moment(date).format('LT')}</div>
      </Comment.Metadata>
      <Comment.Text>{text}</Comment.Text>
    </Comment.Content>
  </Comment>
);

export default Message;
