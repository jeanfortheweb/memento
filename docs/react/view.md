# The View

The concept of views in Memento is straight forward. No "Higher Order Component" magic, no hidden code, no endless wiring of selectors and mappers somewhere else.

A view is defined by just placing the view component somewhere in your component tree.
Each view has 4 pre defined props which you should now:

* **store** A view needs a store to work properly. The view will listen for changes on
  the given store and triggers it's assigned **selectors**.
* **compute** This is a special property which is optional. You can assign a function to it which will receive an object of the current data from all **selectors** and should produce computed values of any kind in return. Whenever the data of the assigned **selectors** change, the compute function will be called. By default, compute will just pass the value object which contains the unchanged **selector** values through.
* **render** Render is just an alias for children or the other way around. You can set either the render prop or
  the children prop. It takes a function which takes the final values and produces components in return. In other words: The render prop takes a stateless functional component.
* **children** See **render**.

Any other property you assign is automatically a **selector** or a **value** and can have any name you wish. If the value is a function, the view will treat it as a **selector**, passing it the current **state** of the **store**. The function should then return the desired part of that **state**. We say "selecting" some state values. Any value that is not a function is taken as is. Whenever the output of a **selector** or a "static value" changes, the **compute** function is called. If the final computed value has changed, the view will render using either the **render** prop or the **children** render function.

In short, the flow looks like:

Gather data from dynamic props (**selectors** or values) **->** did a value change? **->** call compute **->** did computed value change? **->** call render prop.

That's the theory, but I would bet that it's a little easier to follow with some examples.

{% method %}

##### Let's define a state

Let's skip the store creation for now. We just assume that we have a store with a state setup like shown.

{% sample lang="js" %}

```js
// stores/todo.js
import { Record, List } from 'immutable';

class Todo extends Record({
  id: null,
  text: 'Enter todo text...',
  completed: false,
}) {}

class State extends Record({
  visibilityFilter: 'SHOW_ALL',
  todos: List(),
}) {}

// ...

export default store;
```

{% sample lang="ts" %}

```js
// stores/todo.ts
import { Record, List } from 'immutable';

class Todo extends Record<{
  id: string;
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

// ...

export default store;
```

{% endmethod %}

{% method %}

##### Define some basic markup

Before we include the view component we create some markup which reflects our needs.
If we look at the state we can see that we want to render some kind of list for todos.
Let's do that.

{% sample lang="js" %}

```js
// components/Todos.js
import React from 'react';

const Todos = () => (
  <ul>
    <li>Todo #1</li>
    <li>Todo #2</li>
    <li className="completed">Todo #3</li>
  </ul>
);

export default Todos;
```

{% sample lang="ts" %}

```js
// components/Todos.ts
const Todos: React.SFC = () => (
  <ul>
    <li>Todo #1</li>
    <li>Todo #2</li>
    <li className="completed">Todo #3</li>
  </ul>
);

export default Todos;
```

{% endmethod %}

{% method %}

##### Add a basic view

That was easy, wasn't it? Don't worry, it will stay easy.
Let's grab the view component and our store to fill in the actual data.

So what's happening in the component? We just wrapped our presentational part
with a view. As props, we passed the store and one dynamic property: todos.
The value for the todos property is an **inline selector**. Some people would
tell you now that this is a bad practice, since the reference to this value would
change which each render causing unnecessary renders. This is basically true,
but the Memento view is clever and will not do that. This means, when you work
with views, especially when you prototype something, it is totally fine to pass your
**selectors** inline. If this still giving a bad feeling, you can place your **selectors** in the store file and take them from there. Just keep in mind that **selectors** in Memento
should never do computation. Always return the selected data unchanged.

Then, we made the **children** of the view a so called **render prop**. That means that
the only child is a function which will take the computed data as argument. By default,
the view will pass an object containing all of your dynamic properties and their selected
values. This way, you can use **stateless functional components** out of the box.

The rest is just as always: We take our list and map it to some rendered items.
Easy, isn't it?

The interesting part here is, that our view will only render again when
necessary. For example, when a new todo gets into the list. Other libraries can do the same
but Memento makes it hard for you to make mistakes in that process.

{% sample lang="js" %}

```js
// components/Todos.js
import React from 'react';
import { View } from '@memento/react';
import store from 'stores/todo';

const Todos = () => (
  <View store={store} todos={state => state.todos}>
    {data => (
      <ul>
        {data.todos.map(todo => (
          <li key={todo.id} className={todo.completed && 'completed'}>
            {todo.text}
          </li>
        ))}
      </ul>
    )}
  </View>
);

export default Todos;
```

{% sample lang="ts" %}

```js
// components/Todos.ts
import React from 'react';
import { View } from '@memento/react';
import store from 'stores/todo';

const Todos = () => (
  <View store={store} todos={state => state.todos}>
    {data => (
      <ul>
        {data.todos.map(todo => (
          <li key={todo.id} className={todo.completed && 'completed'}>
            {todo.text}
          </li>
        ))}
      </ul>
    )}
  </View>}
```

{% endmethod %}

{% method %}

##### Add a compute property

"But what's about the visibilityFilter in our state", you may ask.
And I will tell you: "That's easy, again!".

Here we add another **selector** for our view to get the current filter value.
On top of that, we define the **compute** property for the view. This disables the default
behavior of the the view and will call the function we pass in two cases: The todos list
changed or the filter value changed.

Then we do some basic filtering, just the usual ES6/Array stuff.

But wait, we don't return an object this time. We return the filtered todos list itself?!
This is fine, since when we override the **compute** property, we can control what value gets returned. The output of the **compute** property is always the input for the **render prop**.

So we adjust the **render prop** arguments. Now we got filtered todos which still render only when necessary.

{% sample lang="js" %}

```js
// components/Todos.js
import React from 'react';
import { View } from '@memento/react';
import store from 'stores/todo';

const Todos = () => (
  <View
    store={store}
    todos={state => state.todos}
    filter={state => state.visibilityFilter}
    compute={data =>
      data.todos.filter(
        todo =>
          data.filter === 'SHOW_ALL' ||
          (data.filter === 'SHOW_COMPLETED' && todo.completed) ||
          (data.filter === 'SHOW_PENDING' && !todo.completed),
      )
    }
  >
    {todos => (
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed && 'completed'}>
            {todo.text}
          </li>
        ))}
      </ul>
    )}
  </View>
);

export default Todos;
```

{% sample lang="ts" %}

```js
// components/Todos.ts
import React from 'react';
import { View } from '@memento/react';
import store from 'stores/todo';

const Todos = () => (
  <View
    store={store}
    todos={state => state.todos}
    filter={state => state.visibilityFilter}
    compute={data =>
      data.todos.filter(
        todo =>
          data.filter === 'SHOW_ALL' ||
          (data.filter === 'SHOW_COMPLETED' && todo.completed) ||
          (data.filter === 'SHOW_PENDING' && !todo.completed),
      )
    }
  >
    {todos => (
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed && 'completed'}>
            {todo.text}
          </li>
        ))}
      </ul>
    )}
  </View>
);

export default Todos;
```

{% endmethod %}

## Next Steps

Of course, we would like to add and toggle todos, but that's not part of the view.
For this, we are going to use a [trigger](./trigger.md).

<br/>
