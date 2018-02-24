# The Task

A task is a simple object that describes something that has to be done. The one how is doing what the task describes will be the worker who accepts it. Every task has a `kind` and a `payload` property. Nothing more and nothing less. The payload depends of the kind of task.

{% method %}

##### Defining task creators

While you could define task objects inline, it's a way more practical to put them into functions. You could write this functions yourself, but Memento gives you a utility for this. As arguments, you pass the kind of task as string and a factory which should create the payload for the task. As result, you're getting a function with the same signature as your factory. When you call this function, a task is created. The handy part is here, that this function can be casted to a string which will output the kind of the task. Later, whenever you want to know the kind of the task, you can use it's creator instead of writing the kind as string again and again.

{% sample lang="js" %}

```js
// stores/todo.js
import { createTask } from '@memento/store';

// (text) => ({ kind: 'ADD_TODO', payload: { text: '...', date: 24235464543 } })
export const addTodo = createTask('ADD_TODO', text => ({
  text,
  date: Date.now(),
}));

// (todo) => ({ kind: 'REMOVE_TODO', payload: <todo object> })
export const removeTodo = createTask(
  'REMOVE_TODO',
  todo => todo,
);

// { kind: 'ADD_TODO', payload: { text: 'Explain Memento', date: 24235464543 } }
addTodo('Explain Memento');

// ADD_TODO
addTodo.toString();
```

{% sample lang="ts" %}

```ts
// stores/todo.js
import { createTask } from '@memento/store';

// (text) => ({ kind: 'ADD_TODO', payload: { text: '...', date: 24235464543 } })
export const addTodo = createTask('ADD_TODO', text => ({
  text,
  date: Date.now(),
}));

// (todo) => ({ kind: 'REMOVE_TODO', payload: <todo object> })
export const removeTodo = createTask(
  'REMOVE_TODO',
  todo => todo,
);

// { kind: 'ADD_TODO', payload: { text: 'Explain Memento', date: 24235464543 } }
addTodo('Explain Memento');

// ADD_TODO
addTodo.toString();
```

{% endmethod %}
