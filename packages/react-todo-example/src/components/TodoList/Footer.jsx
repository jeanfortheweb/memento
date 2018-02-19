import React from 'react';
import { Divider, Grid, Button, Input, Checkbox } from 'semantic-ui-react';
import { View, Trigger } from '@memento/react';
import todoStore, {
  addTodo,
  setTodoText,
  getTodoText,
  getTodos,
  saveTodos,
} from '../../stores/todo';
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
  <Trigger store={todoStore} onAddClick={addTodo(text)} onChange={setTodoText}>
    {({ onChange, onAddClick }) => (
      <Input
        fluid
        value={text}
        onChange={onChange}
        placeholder="Enter todo text..."
        action={
          <Button color="teal" icon="add" onClick={onAddClick} disabled={text.length === 0} />
        }
      />
    )}
  </Trigger>
);

const Footer = () => (
  <Grid>
    <Grid.Row>
      <Grid.Column width={16}>
        <View store={todoStore} text={getTodoText} render={renderTodoTextInput} />
        <Divider />
        <View
          store={todoStore}
          isLoading={state => state.isSaving}
          todos={getTodos}
          link={state => (state.jsonbinID ? `http://api.jsonbin.io/b/${state.jsonbinID}` : '')}
          id={state => state.jsonbinID}
        >
          {({ link, isLoading, todos }) => (
            <Input
              readOnly
              fluid
              onClick={event => event.target.select()}
              value={link}
              action={
                <Trigger store={todoStore} onClick={saveTodos(todos)}>
                  {({ onClick }) => (
                    <Button
                      color="teal"
                      disabled={isLoading}
                      loading={isLoading}
                      icon="save"
                      onClick={onClick}
                    />
                  )}
                </Trigger>
              }
            />
          )}
        </View>
      </Grid.Column>
    </Grid.Row>
  </Grid>
);

export default Footer;
