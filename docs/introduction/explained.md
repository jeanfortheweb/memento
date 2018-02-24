# Memento Explained

The easiest way to explain how Memento works is to compare it to the most popular state management library most of us should know: Redux.

While the conceptual ideas of Redux and Memento are pretty similar, their implementations are not. So lets go through the differences step by step.

## The Store

Both libraries are building onto a store to hold and manage its data. While Redux gives you the `createStore` factory, Memento provides you with a `Store` class.

{% method %}

##### Creating a Store in Redux

When creating a Redux store, you usually provide a `reducer` - which may provide an initial state - and probably some `middlewares` to fill the gaps.

{% sample lang="js" %}

```js
import { createStore, combineReducers, applyMiddleware } from 'redux';

let todoApp = combineReducers(reducers);
let store = createStore(
  todoApp,
  // applyMiddleware() tells createStore() how to handle middleware
  applyMiddleware(logger, crashReporter),
);
```

{% endmethod %}

{% method %}

##### Creating a store in Memento

In Memento there are no `reducers` and no `middlewares`, but `workers`. `Workers` explained in later chapters, but let me say that they fulfill all requirements you may have when we talk about `reducers` or `middlewares`.

{% sample lang="js" %}

```js
import { Store } from '@memento/store';
import State from './state';
import worker from './worker';

const store = new Store(new State(), [someWorker]);
```

{% endmethod %}

{% method %}

##### The Redux store API

Redux gives you the `dispatch` function to dispatch actions on the store, the `getState` function to access the current state and the `subscribe` function to participate in state changes when they happen:

{% sample lang="js" %}

```js
import { addTodo, toggleTodo, setVisibilityFilter, VisibilityFilters } from './actions';

// Log the initial state
console.log(store.getState());

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unsubscribe = store.subscribe(() => console.log(store.getState()));

// Dispatch some actions
store.dispatch(addTodo('Learn about actions'));
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(addTodo('Learn about store'));
store.dispatch(toggleTodo(0));
store.dispatch(toggleTodo(1));
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));

// Stop listening to state updates
unsubscribe();
```

{% endmethod %}

{% method %}

##### The Memento store API

Again, Memento is very similar here. It gives you the `assign` function to assign tasks (tasks are the actions of redux), the `listen` function to listen for state changes and the `select` function to make a selection on the current state:

{% sample lang="js" %}

```js
import {
  store,
  addTodo,
  toggleTodo,
  setVisibilityFilter,
  VisibilityFilters
} from './store';

// Log the initial state
console.log(store.select(state => state));

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unlisten = store.listen((prevState, nextState) =>
  console.log(nextState.toJS()
);

// Dispatch some actions
store.assign(addTodo('Learn about tasks');
store.assign(addTodo('Learn about workers');
store.assign(addTodo('Learn about store');
store.assign(toggleTodo(0));
store.assign(toggleTodo(1));
store.assign(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));

// Stop listening to state updates
unlisten();
```

{% endmethod %}

## Actions vs Tasks

While Redux gives you `actions` to trigger changes, Memento calls them `tasks` and they are again very similar.

{% method %}

##### Actions in Redux

A Redux `action` needs a `type` property and optional any other property you want to pass. Normally you don't use or create these objects by hand, instead, you will use a so called `action creator` which will produce these actions for you.

{% sample lang="js" %}

```js
const ADD_TODO = 'ADD_TODO';

function addTodo(text) {
  return {
    type: ADD_TODO,
    text,
  };
}
```

{% endmethod %}

{% method %}

##### Tasks in Memento

In essence, Memento does the same but calls the type `kind`. On top, `tasks` already have a normalized structure very similiar to `Flux Standard Actions`:

{% sample lang="js" %}

```js
const task = {
  type: 'ADD_TODO',
  payload: 'Build my first Memento app',
};
```

{% endmethod %}

{% method %}

As in Redux, you usually put those into functions, called `task creators`, but you will use an utility for this which comes with Memento. It's very similar to `createAction` from `redux-actions`. Here you don't need an extra constant for the `kind`, since the creator is also the `kind` when casted as string.

{% sample lang="js" %}

```js
import { createTask } from '@memento/store';

const addTodo = createTask('ADD_TODO', text => text);

// { kind: 'ADD_TODO', payload: 'Explain Memento' }
console.log(addTodo('Explain Memento'));

// ADD_TODO
console.log(addTodo.toString());
```

{% endmethod %}

## Reducers vs Workers

Finally we hit a difference. Maybe a big one. You can't really compare `reducers` from Redux with `workers` from Memento. `Workers` can do what `reducers` can but not the other way around. But both of them are, when done right, are pure.

{% method %}

##### Define a state to work with

In any case, we will need a `state` when we want to modify anything. I'll use a `state` that would be required by Memento but is also compatible with Redux. Memento requires you to use `Records` from `immutable`.

Don't feel forced, it's a design decision with reasons and it will pay off.

{% sample lang="js" %}

```js
import { Record, List } from 'immutable';

class Todo extends Record({
  text: 'Enter todo text...',
  completed: false,
}) {}

class State extends Record({
  visibilityFilter: 'SHOW_ALL',
  todos: List(),
}) {}
```

{% common %}

Actually, at this point, only the top most level of the state would be required to be a `Record`, but in the end it pays off to use it any time you're creating a sub-state.

{% endmethod %}

{% method %}

##### The reducer in Redux

Now some action. If you want to react to the `setVisibilityFilter` action in Redux, you would write a `reducer` for it, wouldn't you?

{% sample lang="js" %}

```js
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter,
      });
    default:
      return state;
  }
}
```

{% endmethod %}

{% method %}

##### The worker in Memento

In Memento, you would write a `worker`. A `worker` is a function that takes a `task` and a `state` `observable` and returns a new `observable` that can emit either `updaters` or just more `tasks`. `Updaters` are the `reducers` from Redux. Both input `observables` are suffixed with a dollar sign. This is just a convention to let you know that these are `observables`.

{% sample lang="js" %}

```js
function todoWorker(task$, state$) {
  return task$.accept(setVisibilityFilter).map(task =>
    state => state.set('visibilityFilter', task.payload
  )
}
```

{% endmethod %}

<br />

The result is the same as the `reducer` from Redux. It takes the `task$` observable which initially contains all incoming tasks. Then it only accepts the `setVisibilityFilter` tasks by calling `accept`. We are passing the `task creator` here, since its `toString()` gives us the `kind` of the task we want to accept and the `accept` function knows that. This results in a new observable we can chain on. This new observable will only emit tasks matching the kind of `setVisibilityFilter`. We map those task to an updater function which is more or less a `reducer`. It takes the current state and returns a new one. The store knows that and will run the updater against the current state.

Actually, for those simple tasks you would normally not even write a custom worker, since Memento has already tools for that, but it's still a good example to show off the difference. It's readable and requires less code around while doing the same.

## Summary

Now we know the differences in setting up Redux against setting up Memento. We just scratched the surface, of course. In the next chapters you will learn especially about the Memento standard tools which will give you the power to do more while writing less.

<br/>
