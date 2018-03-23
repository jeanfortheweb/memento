# Memento/Fetcher - Load what you need

[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

Fetcher is a standard library for memento. In essence, it's just a simplified functional wrapper for the default async tools of rxjs. It gives you task creators for setting up xhr requests. To listen for responses and other life cycle events of a request you have to either implement a custom worker or utilize the snitch library.

## Documentation

You can find the complete memento documentation at [memento.js.org](http://memento.js.org).

## Examples

The [react examples](https://github.com/jeanfortheweb/memento/tree/master/packages/react-examples) are our playground for new features and showing off alot of mementos power.

Here is a simple example that will fetch all React releases through the Github api.
It uses the `made` and `snitch` libraries to listen for the response and to set the response on a store property.

```js
import { Store } from '@memento/store';
import createSnitch, { listen } from '@memento/fetcher';
import createFetcher, { request, success } from '@memento/fetcher';
import createMade, { set } from '@memento/made';
import { Record, List } from 'immutable';

class State extends Record({
  releases: List(),
}) {}

const store = new Store(new State(), [
  createMade(),
  createFetcher(),
  createSnitch(),
]);

store.assign(
  listen.once(success, payload =>
    set('releases', List(payload.response.response)),
  ),
);

store.assign(
  request({ url: 'https://api.github.com/repos/facebook/react/releases' }),
);
```

## Installation

To use Memento with Fetcher and React, you'll need to install at least:

```sh
yarn install @memento/store @memento/react @memento/fetcher immutable react react-dom
```
