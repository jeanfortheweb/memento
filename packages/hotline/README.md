# Memento/Hotline - WebSockets everywhere

[![Build Status](https://travis-ci.org/jeanfortheweb/memento.svg?branch=master)](https://travis-ci.org/jeanfortheweb/memento) [![Maintainability](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/maintainability)](https://codeclimate.com/github/jeanfortheweb/memento/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5494041ca69fd977cae6/test_coverage)](https://codeclimate.com/github/jeanfortheweb/memento/test_coverage)

Hotline is a standard library for memento. In essence, it's just a simplified functional wrapper for the default web socket tools of rxjs. It gives you task creators for setting up web sockets. To listen for data and other life cycle events of a web socket you have to either implement a custom worker or utilize the snitch library.

## Documentation

You can find the complete memento documentation at [memento.js.org](http://memento.js.org).

## Examples

You can find our Echo-Chat example at our [react examples](https://github.com/jeanfortheweb/memento/tree/master/packages/react-examples/src/components/EchoChat).

## Installation

To use Memento with Hotline and React, you'll need to install at least:

```sh
yarn install @memento/store @memento/react @memento/hotline immutable react react-dom
```
