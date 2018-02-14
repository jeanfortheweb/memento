import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Store } from '@memento/store';
import { createStoreWorker, createSequenceWorker, sequence, push, merge } from '@memento/common';
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

const todoWorker = (task$, state$) =>
  Observable.merge(
    // we could also do this by using sequence, push and set from @memento/common without
    // the need of a custom worker, but this way, we can pull the text to set from the state
    // so it doesn't have to be passed to addTodo().
    task$
      .accept('@TODO/ADD')
      .withLatestFrom(state$)
      .map(([task, state]) =>
        sequence(
          push('todos', new Todo({ id: shortid.generate(), text: state.text })),
          merge({ text: '' }),
        ),
      ),
    task$
      .accept('@TODO/TOGGLE')
      .map(task => state =>
        state.update('todos', todos =>
          todos.update(todos.findKey(todo => todo.id === task.id), todo =>
            todo.set('done', !todo.done),
          ),
        ),
      ),
  );

// task creators
export const addTodo = () => ({ kind: '@TODO/ADD' });
export const toggleTodo = id => ({ kind: '@TODO/TOGGLE', id });
export const setTodoText = event => merge({ text: event.target.value });

// selectors
export const getTodos = state => state.todos;
export const getTodoText = state => state.text;

export default new Store(new State(), [createStoreWorker(), createSequenceWorker(), todoWorker]);
