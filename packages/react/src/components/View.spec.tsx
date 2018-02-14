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

test('a view renders pure', () => {
  const render = jest.fn(text => <div>{text}</div>);
  const wrapper = mount(
    <View store={store} selector={getText}>
      {render}
    </View>,
  );

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.prop('store')).toEqual(store);
  expect(wrapper.prop('selector')).toEqual(getText);
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
