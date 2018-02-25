import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Record, List } from 'immutable';
import shortid from 'shortid';
import { Store } from '@memento/store';
import createSequencer, { sequence } from '@memento/sequencer';
import createMade, { push, merge, update, set } from '@memento/made';
import createSnitch, { listen, unlisten } from '@memento/snitch';
import createFetcher, { request, success, after, before } from '@memento/fetcher';

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
  jsonbinID: '',
  isSaving: false,
}) {}

// task creators.
export const toggleTodo = todo => () =>
  update('todos', todo, todo.set('done', !todo.done));
export const setTodoText = event => set('text', event.target.value);
export const addTodo = text => () => {
  const pushTodo = push('todos', new Todo({ id: shortid.generate(), text }));
  const clearText = set('text', '');

  return sequence(pushTodo, clearText);
};

export const saveTodos = todos => () =>
  request({
    tags: ['save'],
    url: 'https://api.jsonbin.io/b',
    method: 'POST',
    body: JSON.stringify(todos.toJS()),
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const setupSaveListeners = () => {
  const listenForBefore = listen(
    before,
    ({ tags }) => tags.includes('save'),
    () => set('isSaving', true),
  );

  const listenForSuccess = listen(
    success,
    ({ tags }) => tags.includes('save'),
    ({ response }) => set('jsonbinID', response.response.id),
  );

  const listenForAfter = listen(
    after,
    ({ tags }) => tags.includes('save'),
    () => set('isSaving', false),
  );

  return sequence(listenForBefore, listenForSuccess, listenForAfter);
};

// selectors.
export const getState = state => state;
export const getTodos = state => state.todos;
export const getTodoText = state => state.text;

// create the store with required workers.
const store = new Store(new State(), [
  createSnitch(),
  createMade(),
  createSequencer(),
  createFetcher({
    headers: {
      'Content-Type': 'text/html',
    },
  }),
]);

// add some default todos.
store.assign(addTodo('Add more features')());
store.assign(addTodo('Update documentation')());

// add request listeners.
store.assign(setupSaveListeners());

// explore the latest state in the console.
//store.listen((prev, next) => console.log(next.toJS()));

export default store;
