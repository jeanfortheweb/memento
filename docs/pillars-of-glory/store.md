# The Store

A store is the central element in any Memento eco-system. It holds the state assigned to the store, lets you make selections on that state and lets you assign tasks to workers.

{% method %}

##### Every store needs a state

Before you can create a store, you need at least a root state to pass. States in Memento are represented by [immutable records](https://facebook.github.io/immutable-js/docs/#/Record). This gives us the advantage of a very simple and efficient API for immutable data structures while we can use records, from the outside, just like normal javascript objects.

You are not forced to make every of your sub states a Record, but it's a good practice since these objects will benefit from the records power, too.

{% sample lang="js" %}

```js
// stores/todo.js
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

{% sample lang="ts" %}

```ts
// stores/todo.ts
import { Record, List } from 'immutable';

class Todo extends Record<{
  text: string;
  completed: boolean;
}>({
  text: 'Enter todo text...',
  completed: false,
}) {}

class State extends Record<{
  visibilityFilter: string;
  todos: List<Todo>;
}>({
  visibilityFilter: 'SHOW_ALL',
  todos: List(),
}) {}
```

{% endmethod %}

{% method %}

##### Initialize the store

Now that we have a state record we can work with, we can also create a store. For now the store has no workers assigned, which makes him rather useless, but you would still be able to render the initial state.

{% sample lang="js" %}

```js
// stores/todo.js
import { Store } from '@memento/store';

// the second argument is an empty array of workers.
const store = new Store(new State(), []);
```

{% sample lang="ts" %}

```ts
// stores/todo.ts
import { Store } from '@memento/store';

// the second argument is an empty array of workers.
const store = new Store(new State(), []);
```

{% endmethod %}

{% method %}

##### Make selections on the store

A store allows you to make selections on the current state using its `select` method. As argument, you pass a simple `selector`. It's important to say that selectors in Memento are always very simple and pure functions. They are not meant to do any computations. A selector gets the state as argument and returns an unchanged portion of it.

{% sample lang="js" %}

```js
// stores/todo.js

const currentTodos = store.select(state => state.todos);

console.log(currentTodos.toJS()); // []
```

{% sample lang="ts" %}

```ts
// stores/todo.ts
const currentTodos = store.select(state => state.todos);

console.log(currentTodos.toJS()); // []
```

{% endmethod %}

{% method %}

##### Listen for state changes

A store allows you to listen for state changes usng its `listen` method. As argument, you pass a `listener` function. This function takes the previous and the new state in order.
In return `listen` gives you a callback which you can use to stop your listener.

{% sample lang="js" %}

```js
// stores/todo.js
const unlisten = store.listen((prevState, nextState) =>
  console.log(prevState.toJS(), nextState.toJS()),
);

unlisten(); // stops the listener
```

{% sample lang="ts" %}

```ts
// stores/todo.js
const unlisten = store.listen((prevState, nextState) =>
  console.log(prevState.toJS(), nextState.toJS()),
);

unlisten(); // stops the listener
```

{% endmethod %}

<br/>
