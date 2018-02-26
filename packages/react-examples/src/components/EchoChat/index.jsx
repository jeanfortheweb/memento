import React from 'react';
import { Comment, Grid, Input, Button, Segment } from 'semantic-ui-react';
import Header from './Header';
import Footer from './Footer';
import Messages from './Messages';

const EchoChat = () => (
  <Segment.Group>
    <Header />
    <Messages />
    <Footer />
  </Segment.Group>
);

export default EchoChat;
