# The Worker

A worker is the place, as the name says, where the actual work is done. Workers in Memento are build upon [RxJS](http://reactivex.io/rxjs/). Don't fear the observables, since they give your workers alot of power in a pure way.

##### How a worker is defined

In essence, a worker is just a function that takes two input observables: `task$` and `state$`. These are suffixed arguments by convention so you know that they contain observables. Where the `task$` observable emits everytime a `task` has been assigned, the `state$` observable emits on state changes. As result, the worker has to return a new observable which can either be a `updater function` or other `tasks`.

An `updater` is just a function that takes the current state from the store and output a new state. Some would call that a `reducer`.

{% method %}

##### The most basic task worker

The most basic worker you could write is one that just logs the incoming tasks to the console without doing anything else. Yet we still have to emit something, so we just output an `identity updater`. That means we emit an `updater function` that outputs the input state.

{% sample lang="js" %}

```js
// stores/todo.js
const logTasksWorker = task$ => task$.do(task => console.log(task)).mapTo(state => state);
```

{% sample lang="ts" %}

```js
// stores/todo.ts
const logTasksWorker: Worker<State> = task$ =>
  task$.do(task => console.log(task)).mapTo(state => state);
```

{% endmethod %}

{% method %}

##### Reduce passive state workers to specific state changes.

Almost everytime you don't want to know every single state change in your worker.
You want to do stuff only when a specific part of your state changes. To do so,
you reduce the state you are looking for by using the `select` method of the `state$` observable. As argument, you pass a simple `selector` letting the observable know where you are looking for. As result, you're getting a new observable emitting only the selected state part and only when it has changed.

{% sample lang="js" %}

```js
// stores/todo.js
const logTodosStateWorker = (task$, state$) =>
  state$
    .select(state => state.todos)
    .do(todos => console.log(todos.toJS()))
    .mapTo(state => state);
```

{% sample lang="ts" %}

```js
// stores/todo.ts
const logTodosStateWorker: Worker<State> = (task$, state$) =>
  state$
    .select(state => state.todos)
    .do(todos => console.log(todos.toJS()))
    .mapTo(state => state);
```

{% endmethod %}

{% method %}

##### Accepting specific tasks

Unless you just want so see the task flow like above, you will mostly write workers for just a specific task. To do so, you have to reduce the incoming tasks to a specific type using the `accept` method of the `task$` observable. This will result in a new observable containing only the tasks matching the `kind` given to `accept`.

{% sample lang="js" %}

```js
// stores/todo.js
const addTodoWorker = task$ =>
  task$
    .accept('ADD_TODO')
    .do(task => console.log('Adding todo:', task.payload))
    .mapTo(state => state);

store.assign({ kind: 'TOGGLE_TODO' }); // this will do nothing

store.assign({
  kind: 'ADD_TODO',
  payload: 'Hello Memento!',
}); // this will log to the console.
```

{% sample lang="ts" %}

```js
type AddTodoTask = Task<'ADD_TODO', string>;
type ToggleTodoTask = Task<'TOGGLE_TODO', number>;

// stores/todo.js
const addTodoWorker: Worker<State> = task$ =>
  task$
    .accept<AddTodoTask>('ADD_TODO')
    .do(task => console.log('Adding todo:', task.payload))
    .mapTo(state => state);

store.assign({
  kind: 'TOGGLE_TODO',
  payload: 0,
} as ToggleTodoTask); // this will do nothing

store.assign({
  kind: 'ADD_TODO',
  payload: 'Hello Memento!',
} as AddTodoTask); // this will log to the console.
```

{% endmethod %}

{% method %}

##### Combining incoming tasks with current state.

Sometimes you want to accept tasks, but also use state data at the same time.
This is easy, since you can use the `withLatestFrom` operator of the observable to combine the task you've accepted with the newest state we have.

{% sample lang="js" %}

```js
// stores/todo.js
const updateTodoStats = (task$, state$) =>
  task$
    .accept('UPDATE_TODO_STATS')
    .withLatestFrom(state$.select(state => state.todos))
    .do([task, todos] => console.log('Updating stats for', todos.toJS()))
    .mapTo(state => state);
```

{% sample lang="ts" %}

```js
// stores/todo.js
const updateTodoStats: Worker<State> = (task$, state$) =>
  task$
    .accept('UPDATE_TODO_STATS')
    .withLatestFrom(state$.select(state => state.todos))
    .do([task, todos] => console.log('Updating stats for', todos.toJS()))
    .mapTo(state => state);
```

{% endmethod %}

<br/>
