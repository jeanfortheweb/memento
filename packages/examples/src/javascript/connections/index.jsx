import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from '@memento/memento';
import {
  Container,
  Button,
  Segment,
  Header,
  Divider,
  Grid,
  Icon,
  Message,
  List,
  Form,
} from 'semantic-ui-react';

import contacts from './models/contacts';
import form from './models/form';

// create model instances.
const Contacts = contacts();
const EditForm = form();

// create some default contacts.
Contacts.input.create.next({
  firstName: 'Jean',
  lastName: 'For The Web',
  phone: '12345',
});

Contacts.input.create.next({
  firstName: 'Bill',
  lastName: 'Gates',
  phone: '78910',
});

// create a bidirectional connection between contacts and form.
// that will connect:
//
// Contacts::selected -> Form::selected
// Contacts::contacts -> Form::contacts
// Contacts::create   <- Form::create
// Contacts::update   <- Form::update
// Contacts::select   <- Form::select
connect(Contacts, EditForm, true);

const InfoBox = () => (
  <Message icon info>
    <Icon name="info" />
    <Message.Content>
      <Message.Header>Bidirectional connections</Message.Header>
      <p>In this example, we have two separated models.</p>
      <p>
        These two models are connected to each other bidirectionally. Check our
        the documentation for connections to learn more!
      </p>
      <p>
        Please note that this example has not been optimized for performance. We
        are only using default views and functional components. The focus of
        this example is on the connection feature.
      </p>
    </Message.Content>
  </Message>
);

const ContactListItem = ({ contact, selected, actions }) => (
  <List.Item active={selected === contact.id}>
    <List.Content
      as="a"
      floated="left"
      onClick={() => actions.select(contact.id)}
    >
      {contact.firstName}
    </List.Content>
    <List.Content floated="right">
      <Icon
        name="trash"
        color="red"
        onClick={() => actions.remove(contact.id)}
      />
    </List.Content>
  </List.Item>
);

const ContactEditForm = ({ actions, data }) => (
  <div>
    <Form as={Segment} clearing attached="top">
      <Form.Group widths="equal">
        <Form.Input
          fluid
          label="First name"
          placeholder="First name"
          onChange={event => actions.change(['firstName', event.target.value])}
          value={data.contact.firstName}
        />
        <Form.Input
          fluid
          label="Last name"
          placeholder="Last name"
          onChange={event => actions.change(['lastName', event.target.value])}
          value={data.contact.lastName}
        />
        <Form.Input
          fluid
          label="Phone"
          placeholder="Phone"
          onChange={event => actions.change(['phone', event.target.value])}
          value={data.contact.phone}
        />
      </Form.Group>
    </Form>
    <Button.Group attached="bottom">
      <Button
        disabled={data.valid}
        primary
        icon
        labelPosition="left"
        onClick={actions.save}
      >
        <Icon name="save" />
        Save
      </Button>

      <Button primary icon labelPosition="left" onClick={actions.clear}>
        <Icon name="file" />
        New
      </Button>
    </Button.Group>
  </div>
);

ReactDOM.render(
  <Container>
    <Grid centered>
      <Grid.Column width={12}>
        <Divider hidden />

        <InfoBox />

        <Grid>
          <Grid.Column width={6}>
            <Segment>
              <List divided selection verticalAlign="middle">
                <Contacts.View>
                  {(actions, data) =>
                    data.contacts.map(contact => (
                      <ContactListItem
                        contact={contact}
                        selected={data.selected}
                        actions={actions}
                        key={contact.id}
                      />
                    ))
                  }
                </Contacts.View>
              </List>
            </Segment>
          </Grid.Column>
          <Grid.Column width={10}>
            <EditForm.View>
              {(actions, data) => (
                <ContactEditForm actions={actions} data={data} />
              )}
            </EditForm.View>
          </Grid.Column>
        </Grid>
      </Grid.Column>
    </Grid>
  </Container>,
  document.getElementById('app'),
);
