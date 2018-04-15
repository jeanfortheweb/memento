# Memento - State Management evolved

[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

Memento is a state management library designed for react. It's API is inspired by MVVM and Flux patterns.
Mementos goals are:

* **Scalable** Based on a well designed functional approach which defaults for most common use cases, you will never have to write tons of boilerplate code for the simplest things again. On the other hand, the connection design of Memento allows you to easily extend the features of your app.
* **Predictable** Using pure rxjs observables as the base for input and output interaction, your business logic and state gets more predictable and since we take advantage of rxjs, we also get the full power of managed async data flow and a declarative way.
* **Efficient** Views in Memento are bound to distinct observables which allows it to rerender components only when they really have to.

## Documentation

The documentation is currently out of date and will be updated soon. Until then, checkout the examples package in this repository.

## Examples

The can be found in our [examples](https://github.com/jeanfortheweb/memento/tree/master/packages/examples) package. It's our playground for new features and showing off alot of Mementos power. But to give you a glimpse of the most basic usage:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { model, state } from '@memento/memento';

const counter = model(
  () => ({
    increment: new Subject(),
    decrement: new Subject(),
  }),

  input =>
    state(
      0,
      state.action(input.increment, () => count => count + 1),
      state.action(input.decrement, () => count => count - 1),
    ),
);

const Counter = counter();

ReactDOM.render(
  <Counter.View>
    {(actions, count) => (
      <>
        <span>Count: {count}</span>
        <div>
          <button onClick={actions.increment}>Increment</button>
          <button onClick={actions.decrement}>Decrement</button>
        </div>
      </>
    )}
  </Counter.View>,
  document.getElementById('#app'),
);
```

## Installation

```sh
yarn install @memento/memento
```
