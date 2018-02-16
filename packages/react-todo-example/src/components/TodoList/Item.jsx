import React from 'react';
import { List, Checkbox } from 'semantic-ui-react';
import moment from 'moment';
import { Trigger } from '@memento/react';
import todoStore, { toggleTodo } from '../../stores/todo';

const Item = ({ data }) => (
  <Trigger store={todoStore} onClick={toggleTodo(data)}>
    {({ onClick }) => (
      <List.Item onClick={onClick} active={data.done}>
        <List.Icon
          size="large"
          verticalAlign="middle"
          color="teal"
          name={data.done ? 'check circle' : 'radio'}
        />
        <List.Content>
          <List.Header>{moment(data.date).format('LL')}</List.Header>
          <List.Description>{data.text}</List.Description>
        </List.Content>
      </List.Item>
    )}
  </Trigger>
);

export default Item;
