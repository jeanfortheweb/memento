import { Store, Selector } from '@memento/store';
import * as renderer from 'react-test-renderer';
import { Record } from 'immutable';
import { Projector } from './';
import * as React from 'react';

describe('@memento/react', () => {
  interface StateShape {
    username: string;
    age: number;
  }

  interface StateShape2 {
    username2: string;
    age2: number;
  }

  class State extends Record<StateShape>({
    username: 'Foo',
    age: 1337,
  }) {}

  class State2 extends Record<StateShape2>({
    username2: 'Foo',
    age2: 1337,
  }) {}

  const store = new Store(new State(), []);
  const StringProjector = Projector.for<State, string>();

  const getUsername: Selector<State, string> = state => state.username;

  test('initial render as expected', () => {
    const instance = <StringProjector store={store} selector={getUsername} />;

    const component = renderer.create(instance);

    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
