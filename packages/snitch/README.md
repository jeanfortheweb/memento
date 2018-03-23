# Memento/Snitch - Know what your store is doing

[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

Snitch is a standard library for memento that gives you task creators allowing you to listen for specific tasks or state changes on a memento store. Depending on those events, you can react with tasks to create passive automized business logic.

## Documentation

You can find the complete memento documentation at [memento.js.org](http://memento.js.org).

## Examples

The [react examples](https://github.com/jeanfortheweb/memento/tree/master/packages/react-examples) are our playground for new features and showing off alot of mementos power.

Here is a simple example that will increase the count property of the state everytime the 'MY_TASK_KIND' task gets assigned.

```js
import { Store } from '@memento/store';
import { View } from '@memento/react';
import createSnitch, { listen } from '@memento/snitch';
import createMade, { increase } from '@memento/made';
import { Record } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';

class State extends Record({
  count: 0,
}) {}

const store = new Store(new State(), [createMade(), createSnitch()]);

store.assign(listen('MY_TASK_KIND', () => increase('count')));

store.assign({ kind: 'MY_TASK_KIND' });
store.assign({ kind: 'MY_TASK_KIND' });
store.assign({ kind: 'MY_TASK_KIND' });

const App = () => (
  <View store={store} count={state => state.count}>
    {({ count }) => <div>MY_TASK_KIND has been assigned {count} times.</div>}
  </View>
);

ReactDOM.render(<App />, document.getElementById('#app'));
```

## Installation

To use Memento with Snitch and React, you'll need to install at least:

```sh
yarn install @memento/store @memento/react @memento/snitch immutable react react-dom
```
