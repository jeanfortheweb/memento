import { Store } from '@memento/store';
import { createStoreWorker, createSequenceWorker, sequence, push, merge } from '@memento/common';
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

const todoWorker = (task$, state$) =>
  task$
    // we could also do this by using sequence, push and set from @memento/common without
    // the need of a custom worker, but this way, we can pull the text to set from the state
    // so it doesn't have to be passed to addTodo().
    .accept('@TODO/ADD')
    .withLatestFrom(state$, (task, state) => state =>
      state.update('todos', todos => todos.push(new Todo({ text: state.text }))).set('text', ''),
    );

export const addTodo = () => ({
  kind: '@TODO/ADD',
});

export const setTodoText = event => merge({ text: event.target.value });

export const getTodos = state => state.todos;
export const getTodoText = state => state.text;

export default new Store(new State(), [createStoreWorker(), todoWorker]);
