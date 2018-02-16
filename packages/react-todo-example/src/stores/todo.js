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
  date: Date.now(),
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

export const toggleTodo = todo => () =>
  update(state => {
    const index = state.todos.indexOf(todo);
    const updatedTodo = todo.set('done', !todo.done);

    return state.update('todos', todos => todos.set(index, updatedTodo));
  });

export const setTodoText = event => set('text', event.target.value);

// set, update, remove

// selectors
export const getState = state => state;
export const getTodos = state => state.todos;

export const getTodoText = state => state.text;

export default new Store(new State(), [createStoreWorker(), createSequenceWorker()]);
