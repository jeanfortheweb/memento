import React from 'react';
import { List, Col, Row, Checkbox } from 'antd';
import { Trigger } from '@memento/react';
import todoStore, { toggleTodo } from '../../stores/todo';

const Item = ({ data }) => (
  <List.Item>
    <Row align="middle" type="flex" style={{ width: '100%' }}>
      <Col span={2}>
        <Trigger store={todoStore} onClick={toggleTodo}>
          {({ onClick }) => <Checkbox checked={data.done} onClick={() => onClick(data.id)} />}
        </Trigger>
      </Col>
      <Col span={22}>{data.text}</Col>
    </Row>
  </List.Item>
);

export default Item;
