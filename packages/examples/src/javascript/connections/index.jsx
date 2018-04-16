import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import ReactDOM from 'react-dom';
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

import { ContactsModel, FormModel } from './models';

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
    </Message.Content>
  </Message>
);

const ContactList = () => (
  <Segment>
    <List divided selection verticalAlign="middle">
      <ContactsModel.List>
        {(actions, data) =>
          data.contacts.map(contact => (
            <Contact
              key={contact.id}
              contact={contact}
              selected={data.selected === contact.id}
              onSelect={actions.onSelect}
              onRemoveClick={actions.onRemoveClick}
            />
          ))
        }
      </ContactsModel.List>
    </List>
  </Segment>
);

class Contact extends React.PureComponent {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onRemoveClick = this.onRemoveClick.bind(this);
  }

  onSelect() {
    this.props.onSelect(this.props.contact.id);
  }

  onRemoveClick() {
    this.props.onRemoveClick(this.props.contact.id);
  }

  render() {
    const { contact, selected, onSelect, onRemoveClick } = this.props;

    return (
      <List.Item active={selected}>
        <List.Content as="a" floated="left" onClick={this.onSelect}>
          {contact.lastName}, {contact.firstName}
        </List.Content>
        <List.Content floated="right">
          <Icon name="trash" color="red" onClick={this.onRemoveClick} />
        </List.Content>
      </List.Item>
    );
  }
}

const ContactForm = () => (
  <FormModel.Form>
    {(actions, data) => (
      <Form as={Segment} clearing attached="top">
        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="First name"
            placeholder="First name"
            onChange={actions.onChangeFirstName}
            value={data.contact.firstName}
          />
          <Form.Input
            fluid
            label="Last name"
            placeholder="Last name"
            onChange={actions.onChangeLastName}
            value={data.contact.lastName}
          />
          <Form.Input
            fluid
            label="Phone"
            placeholder="Phone"
            onChange={actions.onChangePhone}
            value={data.contact.phone}
          />
        </Form.Group>
      </Form>
    )}
  </FormModel.Form>
);

const ContactFormActions = () => (
  <FormModel.Actions>
    {(actions, data) => (
      <Button.Group attached="bottom">
        <Button
          disabled={data.valid}
          primary
          icon
          labelPosition="left"
          onClick={actions.onSaveClick}
        >
          <Icon name="save" />
          Save
        </Button>

        <Button
          primary
          icon
          labelPosition="left"
          onClick={actions.onClearClick}
        >
          <Icon name="file" />
          New
        </Button>
      </Button.Group>
    )}
  </FormModel.Actions>
);

ReactDOM.render(
  <Container>
    <Grid centered>
      <Grid.Column width={16}>
        <Divider hidden />

        <InfoBox />

        <Grid>
          <Grid.Column width={6}>
            <ContactList />
          </Grid.Column>
          <Grid.Column width={10}>
            <ContactForm />
            <ContactFormActions />
          </Grid.Column>
        </Grid>
      </Grid.Column>
    </Grid>
  </Container>,
  document.getElementById('app'),
);
