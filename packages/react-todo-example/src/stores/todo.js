import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Store } from '@memento/store';
import { createSequenceWorker, sequence } from '@memento/common';
import createMade, { push, merge, update, set } from '@memento/made';
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

export const toggleTodo = todo => () => update('todos', todo, todo.set('done', !todo.done));

export const setTodoText = event => set('text', event.target.value);

// set, update, remove

// selectors
export const getState = state => state;
export const getTodos = state => state.todos;

export const getTodoText = state => state.text;

const store = new Store(new State(), [createMade(), createSequenceWorker()]);

// add some default todos
store.assign(addTodo('Add more features')());
store.assign(addTodo('Update documentation')());

export default store;
