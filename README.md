# Memento - State Management evolved 
[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

Memento is a state management library which is mainly aims to be used with react. It has four main goals in mind:

* **DRY** Other popular libraries tend to produce heavy boilerplate, even for the simplest things. Memento avoids that with several techniques but also with standard tools which let you express most of the common and also more advanced needs without any real boilerplate. On the other hand, custom solutions and tools share the same aspects: easy to write, none to almost no boilerplate.
* **Declarative** Libraries these days tend to split business logic into alls kinds of separations and often end in so called "Higher Order Components" which tend to hide and complicate things. They are often hard to follow when stacked and can even create conflicts. Memento does not use or need a single "Higher Order Component", but it still lets you express any variety of views or actions, just in place. It is always easy to reason about where values come from and where they go. Conflicts are basically impossible. 
* **Modular** Unlike others, Memento embraces the idea of multiple stores. Whenever it makes sense to isolate data into a separate store you can and should do so. This makes it incredible easy to write isolated application parts which really work without any external dependency. Even the standard tools coming with Memento are clever isolated so that you only include what you need and nothing more (or less!).
* **Efficient** Memento makes it somewhat hard to mess up your props or selectors in a way that your component render performance goes down. This comes from it simple patterns, glued together in an intelligent way, taking away the computation logic spread over files and lets you focus on the actual problems.

## Documentation

Unfortunately there is no real documentation for Memento at this point, but feel free to visit the [react-todo-example](https://github.com/jeanfortheweb/memento/tree/master/packages/react-todo-example) in the meantime. It shows of some of the patterns in Memento and acts like a sandbox for new features-

## Examples

The only "full powered" example at this point is the [react-todo-example](https://github.com/jeanfortheweb/memento/tree/master/packages/react-todo-example), but to give you a minimal glimpse:

```js
import { Store } from '@memento/store'
import { View } from '@memento/react'
import { Record } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';

class State extends Record({
	message: 'Hello World'
}) {}

const store = new Store(new State(), []);

const App = () => (
	<View store={store} message={state => state.message} compute={props => props.message.toUpperCase()}>
		{(yelledMessage) => <div>{yelledMessage}</div>}
	</View>
);

ReactDOM.render(<App />, document.getElementById('#app'))
```

## Installation

To use Memento with react, you'll need to install:

```sh
yarn install @memento/store @memento/react react react-dom immutable
```