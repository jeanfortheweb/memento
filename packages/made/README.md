# Memento/Made - You Mate to get your State made

[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

Made is a standard library for memento. It gives you a good variety of task creators to manipulate your state in a pure and functional way without the need for custom tasks and/or workers.

## Documentation

You can find the memento documentation at [memento.js.org](http://memento.js.org).

## Examples

The [react examples](https://github.com/jeanfortheweb/memento/tree/master/packages/react-examples) are our playground for new features and showing off alot of mementos power.

Here is a simple example showing a controlled text input bound to a memento store:

```js
import { Store } from '@memento/store';
import { View, Trigger } from '@memento/react';
import createMade, { set } from '@memento/made';
import { Record } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';

class State extends Record({
  message: 'Hello World',
}) {}

const store = new Store(new State(), [createMade()]);

const App = () => (
  <Trigger store={store} onChange={event => set('message', event.target.value)}>
    {trigger => (
      <View store={store} message={state => state.message}>
        {props => (
          <input
            type="text"
            onChange={trigger.onChange}
            value={props.message}
          />
        )}
      </View>
    )}
  </Trigger>
);

ReactDOM.render(<App />, document.getElementById('#app'));
```

## Installation

To use Made with Memento and react, you'll need to install at least (not including react itself):

```sh
yarn install @memento/store @memento/react @memento/made immutable react react-dom
```
