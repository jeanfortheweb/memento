import React from 'react';
import { Row, Col, Button, Input } from 'antd';
import { View, Trigger } from '@memento/react';
import todoStore, { addTodo, setTodoText, getTodoText } from '../../stores/todo';

const AddButton = () => (
  <Trigger store={todoStore} factory={addTodo}>
    {onClick => <Button onClick={onClick}>Add Todo</Button>}
  </Trigger>
);

const TextInput = () => (
  <Trigger store={todoStore} factory={setTodoText}>
    {onChange => (
      <View store={todoStore} selector={getTodoText}>
        {text => <Input value={text} onChange={onChange} placeholder="Enter todo text..." />}
      </View>
    )}
  </Trigger>
);

const Footer = () => (
  <Row justify="end">
    <Col span={18}>
      <TextInput />
    </Col>
    <Col offset={2} span={2}>
      <AddButton />
    </Col>
  </Row>
);

export default Footer;
