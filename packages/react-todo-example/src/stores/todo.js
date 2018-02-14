import { Store } from '@memento/store';
import { createStoreWorker, push, merge } from '@memento/common';
import { Record, List } from 'immutable';

export class Todo extends Record({
  id: null,
  text: 'Enter a todo text',
  done: false,
}) {}

export class State extends Record({
  todos: List(),
  text: '',
}) {}

const clearTextWorker = (task$, state$) =>
  state$.select(getTodos).mapTo(state => state.set('text', ''));

export const addTodo = text => push({ path: 'todos', data: [new Todo({ text })] });
export const setTodoText = event => merge({ data: { text: event.target.value } });

export const getTodos = state => state.todos;
export const getTodoText = state => state.text;

export default new Store(new State(), [createStoreWorker(), clearTextWorker]);
