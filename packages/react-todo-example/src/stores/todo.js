import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Store } from '@memento/store';
import {
  createStoreWorker,
  createSequenceWorker,
  sequence,
  push,
  merge,
  update,
  set,
} from '@memento/common';
import { Record, List } from 'immutable';
import shortid from 'shortid';

export class Todo extends Record({
  id: null,
  text: 'Enter a todo text',
  done: false,
}) {}

export class State extends Record({
  todos: List(),
  text: '',
}) {}

// task creators.
export const addTodo = text => () => {
  const pushTodo = push('todos', new Todo({ id: shortid.generate(), text }));
  const clearText = set('text', '');

  return sequence(pushTodo, clearText);
};

export const toggleTodo = id => () =>
  update(state =>
    state.todos.update(todos.findKey(todo => todo.id === task.id), todo =>
      todo.set('done', !todo.done),
    ),
  );

export const setTodoText = event => set('text', event.target.value);

// set, update, remove

// selectors
export const getState = state => state;
export const getTodos = state => state.todos;

export const getTodoText = state => state.text;

export default new Store(new State(), [createStoreWorker(), createSequenceWorker()]);
