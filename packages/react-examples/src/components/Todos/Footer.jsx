import React from 'react';
import { Divider, Grid, Button, Input, Checkbox } from 'semantic-ui-react';
import { View, Trigger } from '@memento/react';
import store, {
  addTodo,
  setTodoText,
  getTodoText,
  getTodos,
  saveTodos,
  getFilter,
  setFilter,
} from './store';

const FilterCheckbox = ({ value }) => (
  <View store={store} filter={getFilter}>
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

const TodoTextInput = ({ text }) => (
  <Trigger store={store} onAddClick={addTodo(text)} onChange={setTodoText}>
    {({ onChange, onAddClick }) => (
      <Input
        fluid
        value={text}
        onChange={onChange}
        placeholder="Enter todo text..."
        action={
          <Button
            color="teal"
            icon="add"
            onClick={onAddClick}
            disabled={text.length === 0}
          />
        }
      />
    )}
  </Trigger>
);

const Footer = () => (
  <Grid>
    <Grid.Row>
      <Grid.Column width={16}>
        <View store={store} text={getTodoText} render={TodoTextInput} />
      </Grid.Column>
    </Grid.Row>
  </Grid>
);

export default Footer;
