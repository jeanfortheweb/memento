import React from 'react';
import { List } from 'antd';
import { Trigger } from '@memento/react';
import todoStore, { addTodo } from '../../stores/todo';

const Item = ({ data }) => <List.Item>{data.text}</List.Item>;

export default Item;
