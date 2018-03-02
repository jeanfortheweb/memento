# The Trigger

When it comes to doing something, you will need a trigger to trigger that something.
Triggers work very similar to views. It's again a component without any big magic which you
define inside your component tree. But instead of creating dynamic values using **selectors**, you pass **task creators** to it. This will bind these to the given **store** which also get's passed, just as we did with views.

{% method %}

##### Let's define an input component

Based on the [the view](./view.md) we've just created, we're going to create another
component to input some todo text and a button to submit this text. We could manage the
text to be stored inside Memento of course, but for this we're taking the classic road
by storing the text temporary in the internal state.

{% sample lang="js" %}

```js
import React from 'react';

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };
  }

  handleChange = event => {
    this.setState(state => ({
      ...state,
      text: event.target.value,
    }));
  };

  render() {
    const { text } = this.state;
    const disabled = text.length === 0;

    return [
      <input key="input" type="text" value={text} onChange={this.handleChange} />,
      <button key="button" disabled={disabled}>
        Add
      </button>,
    ];
  }
}

export default Input;
```

{% sample lang="ts" %}

```ts
import React from 'react';

export interface State = {
    text: string;
}

class Input extends React.Component<any, State> {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };
  }

  handleChange = event => {
    this.setState(state => ({
      ...state,
      text: event.target.value,
    }));
  };

  render() {
    const { text } = this.state;
    const disabled = text.length === 0;

    return [
      <input key="input" type="text" value={text} onChange={this.handleChange} />,
      <button key="button" disabled={disabled}>
        Add
      </button>,
    ];
  }
}

export default Input;
```

{% endmethod %}

##### Add the trigger

As said, triggers working very similiar to views. The pass the store and dynamic props
which contain **task creators**. These **task creators**, just the **selectors** can be inline or stored outside, in the store file for example. How you like to work is up to you. For getting a **task** doing something we would need a **worker**.

{% method %}

But instead of defining a **worker**, lets use a standard library of Memento this time.
With made, we can do a lot of state manipulation we do everyday with some simple lines.

{% common %}

```sh
yarn add @memento/made
```

{% endmethod %}

{% method %}

The only line we need here for now is the `push` **task creator** from made. He takes a path to our list inside the **state** and any number of elements to push. That's all we need to do to see a new todo rendered in our [view](./view.md).

{% sample lang="js" %}

```js
import React from 'react';
import { push } from '@memento/made';
import store from './stores/todo.js';

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };
  }

  handleChange = event => {
    this.setState(state => ({
      ...state,
      text: event.target.value,
    }));
  };

  render() {
    const { text } = this.state;
    const disabled = text.length === 0;

    return [
      <input key="input" type="text" value={text} onChange={this.handleChange} />,
      <Trigger store={store} onClick={() => push('todos', new Todo({ text }))}>
        {({ onClick }) => (
          <button key="button" onClick={onClick} disabled={disabled}>
            Add
          </button>
        )}
      </Trigger>,
    ];
  }
}

export default Input;
```

{% sample lang="ts" %}

```js
import React from 'react';
import { push } from '@memento/made';
import store from './stores/todo.js';

export interface State = {
    text: string;
}

class Input extends React.Component<any, State> {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
    };
  }

  handleChange = event => {
    this.setState(state => ({
      ...state,
      text: event.target.value,
    }));
  };

  render() {
    const { text } = this.state;
    const disabled = text.length === 0;

    return [
      <input key="input" type="text" value={text} onChange={this.handleChange} />,
      <Trigger store={store} onClick={() => push('todos', new Todo({ text }))}>
        {({ onClick }) => (
          <button key="button" onClick={onClick} disabled={disabled}>
            Add
          </button>
        )}
      </Trigger>,
    ];
  }
}

export default Input;;
```

{% endmethod %}

{% method %}

Nothing happens when we click the button. But why? Well, we have to add the **worker** from **made** to our **store** constructor. How else should the worker aware of our **state** and **tasks**? Let's edit the store file and add the **worker**.

{% sample lang="js" %}

```js
// stores/todos.js
import createMade from '@memento/made';

// ...

export default new Store(new State(), [createMade()]);
```

{% sample lang="ts" %}

```js
// stores/todos.js
import createMade from '@memento/made';

// ...

export default new Store(new State(), [createMade()]);
```

{% endmethod %}

## Summary

These are the basics for working with Memento in React. If you like to see some already working examples with full source code, visit the [react examples](https://github.com/jeanfortheweb/memento/tree/master/packages/react-examples) in the repository!
