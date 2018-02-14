import * as React from 'react';
import { Record } from 'immutable';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { Store, Selector } from '@memento/store';
import { createStateUpdater, updateState } from '@memento/common';
import View from './View';

configure({ adapter: new Adapter() });

interface StateProps {
  text: string;
}

class State extends Record<StateProps>({
  text: '',
}) {}

const store = new Store(new State(), [createStateUpdater<State, StateProps>()]);
const getText: Selector<State, string> = state => state.text;
const StringView = View.for<State, string>();

test('a view does subscribe and unsubscribe from the given store', () => {
  const listen = store.listen;
  const stop = jest.fn();

  store.listen = jest.fn(listener => {
    stop.mockImplementation(listen.apply(store, [listener]));

    return stop;
  });

  const wrapper = mount(<StringView store={store} selector={getText} />);

  expect(store.listen).toHaveBeenCalledTimes(1);

  wrapper.unmount();

  expect(stop).toHaveBeenCalledTimes(1);

  store.listen = listen;
});

test('a view renders with explicit render function', () => {
  const render = jest.fn(text => <div>{text}</div>);
  const wrapper = mount(
    <StringView store={store} selector={getText}>
      {render}
    </StringView>,
  );

  expect(wrapper.find('div').length).toEqual(1);
  expect(render).toBeCalledWith('');

  store.assign(
    updateState({
      text: 'Hello',
    }),
  );

  expect(render).toBeCalledWith('Hello');

  store.assign(
    updateState({
      text: 'Hello',
    }),
  );

  expect(render).toHaveBeenCalledTimes(2);
});

test('a view renders without explicit render function', () => {
  const wrapper = mount(<StringView store={store} selector={getText} />);

  expect(wrapper.contains('Hello')).toEqual(true);
});
