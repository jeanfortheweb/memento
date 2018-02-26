import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Record, List } from 'immutable';
import shortid from 'shortid';
import { Store } from '@memento/store';
import createSequencer, { sequence } from '@memento/sequencer';
import createMade, { push, merge, update, set } from '@memento/made';
import createSnitch, { listen, unlisten } from '@memento/snitch';

// state.
export class Todo extends Record({
  id: null,
  date: Date.now(),
  text: 'Enter a todo text',
  done: false,
}) {}

export class State extends Record({
  todos: List(),
  text: '',
  filter: 'ALL',
}) {}

// task creators.
export const toggleTodo = todo => () =>
  update('todos', todo, todo.set('done', !todo.done));

export const setTodoText = event => set('text', event.target.value);
export const setFilter = value => () => set('filter', value.toUpperCase());

export const addTodo = text => () => {
  const pushTodo = push('todos', new Todo({ id: shortid.generate(), text }));
  const clearText = set('text', '');

  return sequence(pushTodo, clearText);
};

// selectors.
export const getTodos = state => state.todos;
export const getTodoText = state => state.text;
export const getFilter = state => state.filter;

// create the store with required workers.
const store = new Store(new State(), [createSnitch(), createMade(), createSequencer()]);

// add some default todos.
store.assign(addTodo('Add more features')());
store.assign(addTodo('Update documentation')());

export default store;
