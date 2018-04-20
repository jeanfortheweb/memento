import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { startWith, delay } from 'rxjs/operators';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import view from './view';
import model from './model';
import {
  InputCreator,
  OutputCreator,
  ActionCreator,
  DataCreator,
  ViewProps,
  ViewState,
} from './core';

configure({ adapter: new Adapter() });

type Input = {
  a: number;
  b: number;
};

type Actions = {
  a: number;
};

type Output = {
  c: number;
};

type Data = {
  c: number;
};

const inputCreator: InputCreator<Input> = () => ({
  a: new Subject(),
  b: new Subject(),
});

const outputCreator: OutputCreator<Input, Output> = input => ({
  c: merge(input.a, input.b).pipe(startWith(0)),
});

let actions;

const mapInputToActions: ActionCreator<Input, Actions> = input =>
  (actions = {
    a: value => input.a.next(value),
  });

const mapOutputToData: DataCreator<Output, Data> = (output, props) => ({
  c: output.c,
});

const mapOutputToSingleData: DataCreator<Output, number> = (output, props) =>
  output.c;

const viewCreator = view(mapInputToActions, mapOutputToData);
const singleOutputViewCreator = view(mapInputToActions, mapOutputToSingleData);
const noActionsViewCreator = view(null, mapOutputToSingleData);
const noDataViewCreator = view(mapInputToActions);

const modelCreator = model(inputCreator, outputCreator);
const modelInstance = modelCreator();

const View = viewCreator(modelInstance.input, modelInstance.output, {});
const NoActionsView = noActionsViewCreator(
  modelInstance.input,
  modelInstance.output,
  {},
);
const NoDataView = noDataViewCreator(
  modelInstance.input,
  modelInstance.output,
  {},
);
const SingleView = singleOutputViewCreator(
  modelInstance.input,
  modelInstance.output,
  {},
);

function waitForDataUpdate<TOutput>(
  component: React.Component<
    ViewProps<any, TOutput> & { prop: boolean },
    ViewState<any, TOutput>
  >,
): Promise<TOutput> {
  return new Promise(resolve => {
    const subscription = component.state.observable
      .pipe(delay(10))
      .subscribe(value => {
        subscription.unsubscribe();
        resolve(value);
      });
  });
}

test('should create a view creator', () => {
  expect(typeof viewCreator).toEqual('function');
});

test('should create and render a passthrough view', async () => {
  const passthroughViewCreator = view.passthrough();
  const PassthroughView = passthroughViewCreator(
    modelInstance.input,
    modelInstance.output,
    {},
  );

  expect(typeof PassthroughView).toEqual('function');

  const render = jest.fn((actions, data) => {
    expect(actions).toBeDefined();
    expect(data).toBeDefined();

    return <div>{data.c}</div>;
  });

  const wrapper = mount(<PassthroughView>{render}</PassthroughView>);
  await waitForDataUpdate<Output>(wrapper.instance());

  wrapper.instance().state.actions.a(0);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.find('div').text()).toEqual(data.c.toString());
  expect(render).toHaveBeenCalledTimes(1);

  wrapper.unmount();
});

test('should create a view from view creator', () => {
  expect(typeof View).toEqual('function');
});

test('should render a view', async () => {
  const render = jest.fn((actions, data) => <div>{data.c}</div>);
  const wrapper = mount(<View>{render}</View>);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.find('div').text()).toEqual(data.c.toString());
  expect(render).toHaveBeenCalledTimes(1);

  wrapper.unmount();
});

test('should render a view with single output', async () => {
  const render = jest.fn((actions, data) => <div>{data}</div>);
  const wrapper = mount(<SingleView>{render}</SingleView>);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.find('div').text()).toEqual(data.toString());
  expect(render).toHaveBeenCalledTimes(1);

  wrapper.unmount();
});

test('should render a view without actions', async () => {
  const render = jest.fn((actions, data) => <div>{data}</div>);
  const wrapper = mount(<NoActionsView>{render}</NoActionsView>);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.find('div').text()).toEqual(data.toString());
  expect(render).toHaveBeenCalledTimes(1);
  expect(render).toHaveBeenLastCalledWith({}, 0);

  wrapper.unmount();
});

test('should render a view without children', async () => {
  const wrapper = mount(<NoActionsView />);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.text()).toEqual(data.toString());

  wrapper.unmount();
});

test('should render a view without data', async () => {
  const render = jest.fn((actions, data) => 'NoData');
  const wrapper = mount(<NoDataView>{render}</NoDataView>);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(data).toEqual(null);
  expect(render).toHaveBeenCalledTimes(1);
  expect(render).toHaveBeenLastCalledWith(actions, null);
  expect(wrapper.text()).toEqual('NoData');

  wrapper.unmount();
});

test('should rerender a view when data changes', async () => {
  const render = jest.fn((actions, data) => <div>{data.c}</div>);
  const wrapper = mount(<View>{render}</View>);

  modelInstance.input.a.next(1);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.find('div').text()).toEqual(data.c.toString());
  expect(render).toHaveBeenCalledTimes(2);

  wrapper.unmount();
});

test('should not rerender a view when data did not change', async () => {
  const render = jest.fn((actions, data) => <div>{data.c}</div>);
  const wrapper = mount(<View>{render}</View>);

  modelInstance.input.a.next(1);
  modelInstance.input.a.next(1);
  modelInstance.input.a.next(1);

  const data = await waitForDataUpdate<Output>(wrapper.instance());

  expect(wrapper.find('div').length).toEqual(1);
  expect(wrapper.find('div').text()).toEqual(data.c.toString());
  expect(render).toHaveBeenCalledTimes(1);

  wrapper.unmount();
});

test('should rerender a view when a prop changes', async () => {
  const render = jest.fn((actions, data) => <div>{data.c}</div>);
  const wrapper = mount(<View>{render}</View>);

  expect(render).toHaveBeenCalledTimes(1);

  wrapper.setProps(
    {
      prop: true,
    },
    async () => {
      const data = await waitForDataUpdate<Output>(wrapper.instance());

      expect(wrapper.find('div').length).toEqual(1);
      expect(wrapper.find('div').text()).toEqual(data.c.toString());
      expect(render).toHaveBeenCalledTimes(2);
    },
  );

  wrapper.unmount();
});

test('should not rerender a view when props did not change', async () => {
  const render = jest.fn((actions, data) => <div>{data.c}</div>);
  const wrapper = mount(<View>{render}</View>);

  expect(render).toHaveBeenCalledTimes(1);

  wrapper.setProps(
    {
      prop: true,
    },
    async () => {
      const data = await waitForDataUpdate<Output>(wrapper.instance());

      expect(wrapper.find('div').length).toEqual(1);
      expect(wrapper.find('div').text()).toEqual(data.c.toString());
      expect(render).toHaveBeenCalledTimes(2);
    },
  );

  wrapper.setProps(
    {
      prop: true,
    },
    async () => {
      const data = await waitForDataUpdate<Output>(wrapper.instance());

      expect(wrapper.find('div').length).toEqual(1);
      expect(wrapper.find('div').text()).toEqual(data.c.toString());
      expect(render).toHaveBeenCalledTimes(2);
    },
  );

  wrapper.unmount();
});
