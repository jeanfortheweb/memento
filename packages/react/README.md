# Memento/Made - State Manipulation Tools

[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

This is the official React binding for Memento. It provides declarative components to bind your presentational components to your memento state and task creators in a flux like pattern. Unlike most libraries, these components are not created by decorators and do not generate hidden code. Instead, they make use of the render props pattern to make the code fully declarative, conflict free and easy to follow.

## Documentation

You can find the memento documentation at [memento.js.org](http://memento.js.org).

## Examples

The [react examples](https://github.com/jeanfortheweb/memento/tree/master/packages/react-examples) are our playground for new features and showing off alot of mementos power.

Here is a simple example showing a message which gets recomputed to uppercase and then displayed.

```js
import { Store } from '@memento/store';
import { View } from '@memento/react';
import { Record } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';

class State extends Record({
  message: 'Hello World',
}) {}

const store = new Store(new State(), []);

const App = () => (
  <View
    store={store}
    message={state => state.message}
    compute={props => props.message.toUpperCase()}
  >
    {yelledMessage => <div>{yelledMessage}</div>}
  </View>
);

ReactDOM.render(<App />, document.getElementById('#app'));
```

## Installation

To use Memento and React, you'll need to install at least:

```sh
yarn install @memento/store @memento/react @memento/made immutable react react-dom
```
