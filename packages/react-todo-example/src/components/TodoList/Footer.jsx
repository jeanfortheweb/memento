import React from 'react';
import { Row, Col, Button, Input, Checkbox } from 'antd';
import { View, Trigger } from '@memento/react';
import todoStore, { addTodo, setTodoText, getTodoText } from '../../stores/todo';
import settingsStore, { getFilter, setFilter } from '../../stores/settings';

const FilterCheckbox = ({ value }) => (
  <View store={settingsStore} filter={getFilter}>
    {({ filter }) => (
      <div>
        <Trigger store={settingsStore} onClick={setFilter}>
          {({ onClick }) => (
            <Checkbox
              checked={filter === value.toUpperCase()}
              onClick={() => onClick(value.toUpperCase())}
            />
          )}
        </Trigger>{' '}
        Show {value}
      </div>
    )}
  </View>
);

const renderTodoTextInput = ({ text }) => (
  <Trigger store={todoStore} onChange={setTodoText}>
    {({ onChange }) => <Input value={text} onChange={onChange} placeholder="Enter todo text..." />}
  </Trigger>
);

const renderAddTodoButton = ({ text }) => (
  <Trigger store={todoStore} onClick={addTodo(text)}>
    {({ onClick }) => <Button onClick={onClick}>Add Todo</Button>}
  </Trigger>
);

const Footer = () => (
  <div>
    <Row type="flex" justify="start">
      <Col span={18}>
        <View store={todoStore} text={getTodoText} render={renderTodoTextInput} />
      </Col>
      <Col offset={2} span={2}>
        <View store={todoStore} text={getTodoText} render={renderAddTodoButton} />
      </Col>
    </Row>

    <Row style={{ height: 40 }} type="flex" align="middle">
      <Col span={6}>
        <FilterCheckbox value="All" />
      </Col>
      <Col span={6}>
        <FilterCheckbox value="Pending" />
      </Col>
      <Col span={6}>
        <FilterCheckbox value="Done" />
      </Col>
    </Row>
  </div>
);

export default Footer;
