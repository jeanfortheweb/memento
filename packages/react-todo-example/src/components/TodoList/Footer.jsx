import React from 'react';
import { Row, Col, Button, Input, Checkbox } from 'antd';
import { View, Trigger } from '@memento/react';
import todoStore, { addTodo, setTodoText, getTodoText } from '../../stores/todo';
import settingsStore, { getFilter, setFilter } from '../../stores/settings';

const Footer = () => (
  <div>
    <Row type="flex" justify="start">
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
    <View store={settingsStore} selector={getFilter}>
      {filter => (
        <Trigger store={settingsStore} factory={setFilter}>
          {onClick => (
            <Row style={{ height: 40 }} type="flex" align="middle">
              {['All', 'Pending', 'Done'].map(value => (
                <Col key={value} span={6}>
                  <Checkbox
                    checked={filter === value.toUpperCase()}
                    onClick={() => onClick(value.toUpperCase())}
                  />{' '}
                  Show {value}
                </Col>
              ))}
            </Row>
          )}
        </Trigger>
      )}
    </View>
  </div>
);

export default Footer;
