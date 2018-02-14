import { Store } from '@memento/store';
import { createStateUpdater } from '@memento/common';
import { Record, List } from 'immutable';

export class Todo extends Record({
  id: null,
  text: 'Enter a todo text',
  done: false,
}) {}

export class State extends Record({
  todos: List([new Todo()]),
}) {}

export const getTodos = state => state.todos;

export default new Store(new State(), [createStateUpdater()]);
