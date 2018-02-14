import React from 'react';
import { List, Col, Row, Checkbox } from 'antd';
import { Trigger } from '@memento/react';
import todoStore, { addTodo } from '../../stores/todo';

const Item = ({ data }) => (
  <List.Item>
    <Row align="middle" type="flex" style={{ width: '100%' }}>
      <Col span={2}>
        <Checkbox />
      </Col>
      <Col span={22}>{data.text}</Col>
    </Row>
  </List.Item>
);

export default Item;
