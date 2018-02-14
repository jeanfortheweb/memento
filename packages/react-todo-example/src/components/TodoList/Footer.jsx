import React from 'react';
import { Row, Col, Button, Input } from 'antd';
import { View, Trigger } from '@memento/react';
import todoStore, { addTodo, setTodoText, getTodoText } from '../../stores/todo';

const Footer = () => (
  <Row justify="end">
    <Col span={18}>
      <Trigger store={todoStore} factory={setTodoText}>
        {onChange => (
          <View store={todoStore} selector={getTodoText}>
            {text => <Input value={text} onChange={onChange} placeholder="Enter todo text..." />}
          </View>
        )}
      </Trigger>
    </Col>
    <Col offset={2} span={2}>
      <Trigger store={todoStore} factory={addTodo}>
        {onClick => <Button onClick={onClick}>Add Todo</Button>}
      </Trigger>
    </Col>
  </Row>
);

export default Footer;
