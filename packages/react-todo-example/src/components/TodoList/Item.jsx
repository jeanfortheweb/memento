import React from 'react';
import { List, Checkbox } from 'semantic-ui-react';
import { Trigger } from '@memento/react';
import todoStore, { toggleTodo } from '../../stores/todo';

const Item = ({ data }) => (
  <List.Item>
    <List.Content floated="right">
      <Trigger store={todoStore} onClick={toggleTodo(data)}>
        {({ onClick }) => <Checkbox checked={data.done} onClick={onClick} />}
      </Trigger>
    </List.Content>
    <List.Content>{data.text}</List.Content>
  </List.Item>
);

export default Item;
