import * as React from 'react';
import { Record } from 'immutable';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { Store, Selector } from '@memento/store';
import { createStoreWorker, merge } from '@memento/common';
import View from './View';

configure({ adapter: new Adapter() });

interface StateProps {
  text: string;
}

class State extends Record<StateProps>({
  text: '',
}) {}

const store = new Store(new State(), [createStoreWorker<State, StateProps>()]);
const anotherStore = new Store(new State({ text: 'foo' }), [
  createStoreWorker<State, StateProps>(),
]);
const getText: Selector<State, string> = state => state.text;
const StringView = View.for<State, { value: string }, string>();

test('a view does subscribe and unsubscribe from the given store', () => {
  const listen = store.listen;
  const stop = jest.fn();

  store.listen = jest.fn(listener => {
    stop.mockImplementation(listen.apply(store, [listener]));

    return stop;
  });

  const wrapper = mount(
    <StringView store={store} value={getText} compute={({ value }) => value} />,
  );

  expect(store.listen).toHaveBeenCalledTimes(1);

  wrapper.unmount();

  expect(stop).toHaveBeenCalledTimes(1);

  store.listen = listen;
});

test('a view renders with explicit render function', () => {
  const render = jest.fn(text => <div>{text}</div>);
  const wrapper = mount(
    <StringView store={store} value={getText} compute={({ value }) => value}>
      {render}
    </StringView>,
  );

  expect(wrapper.find('div').length).toEqual(1);
  expect(render).toBeCalledWith('');
});

test('a view renders without explicit render function', () => {
  const wrapper = mount(
    <StringView store={store} value={getText} compute={({ value }) => value} />,
  );

  store.assign(
    merge({
      text: 'Hello',
    }),
  );

  expect(wrapper.text()).toEqual('Hello');
});

test('a view recomputes only on prop change', () => {
  const compute = jest.fn(({ value }) => value);
  const wrapper = mount(<StringView store={store} value={getText} compute={compute} />);

  expect(compute).toHaveBeenCalledTimes(1);

  store.assign(
    merge({
      text: 'Hello',
    }),
  );

  expect(compute).toHaveBeenCalledTimes(1);

  wrapper.setProps({
    value: 'static',
  });

  expect(compute).toHaveBeenCalledTimes(2);
  expect(wrapper.text()).toEqual('static');
});

test('a view recomputes when store changes', () => {
  const compute = jest.fn(({ value }) => value);
  const wrapper = mount(<StringView store={store} value={getText} compute={compute} />);

  wrapper.setProps({
    store: anotherStore,
  });

  expect(compute).toHaveBeenCalledTimes(2);
  expect(wrapper.text()).toEqual('foo');
});

test('a view renders without explicit compute function', () => {
  const render = jest.fn(({ value }) => value);
  const wrapper = mount(
    <StringView store={store} value={getText}>
      {render}
    </StringView>,
  );

  wrapper.setProps({
    store: anotherStore,
  });

  expect(render).toHaveBeenCalledTimes(2);
  expect(wrapper.text()).toEqual('foo');
});
