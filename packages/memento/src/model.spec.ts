import { Observable, Subject, merge } from 'rxjs';
import { InputCreator, OutputCreator, ViewCreators, Model } from './core';
import model from './model';
import { view } from '.';

type Input = {
  a: number;
  b: number;
};

type Output = {
  c: number;
};

type SingleOutput = Observable<number>;

function instantiate<
  TInput,
  TOutput,
  TOptions,
  TViewCreators extends ViewCreators<TViewCreators>
>(
  inputCreator: InputCreator<TInput>,
  outputCreator: OutputCreator<TInput, TOutput>,
  viewCreators?: TViewCreators,
  options?: TOptions,
): Model<TInput, TOutput, TViewCreators> {
  const mockedInputCreator = jest.fn(inputCreator as any);
  const mockedOutputCreator = jest.fn(outputCreator as any);
  const modelCreator = model<TInput, TOutput, TOptions, TViewCreators>(
    mockedInputCreator,
    mockedOutputCreator,
    viewCreators as any,
  );

  expect(typeof modelCreator).toEqual('function');

  const modelInstance = modelCreator(options as any);

  expect(mockedInputCreator).toHaveBeenCalledTimes(1);
  expect(mockedOutputCreator).toHaveBeenCalledTimes(1);

  expect(modelInstance.input).toBeDefined();
  expect(modelInstance.output).toBeDefined();

  if (options) {
    expect(mockedInputCreator).toHaveBeenLastCalledWith(options);
    expect(mockedOutputCreator.mock.calls[0][1]).toEqual(options);
  }

  if (viewCreators) {
    Object.keys(viewCreators).forEach(name => {
      expect(typeof modelInstance[name]).toEqual('function');
    });
  } else {
    expect(typeof modelInstance['View']).toEqual('function');
  }

  return modelInstance as any;
}

test('should create model instance with multiple outputs', () => {
  const inputCreator: InputCreator<Input> = () => ({
    a: new Subject(),
    b: new Subject(),
  });

  const outputCreator: OutputCreator<Input, Output> = input => ({
    c: merge(input.a, input.b),
  });

  instantiate(inputCreator, outputCreator);
});

test('should create model instance with single output', () => {
  const inputCreator: InputCreator<Input> = () => ({
    a: new Subject(),
    b: new Subject(),
  });

  const outputCreator: OutputCreator<Input, SingleOutput> = input =>
    merge(input.a, input.b);

  instantiate(inputCreator, outputCreator);
});

test('should create model instance with options', () => {
  const inputCreator: InputCreator<Input> = () => ({
    a: new Subject(),
    b: new Subject(),
  });

  const outputCreator: OutputCreator<Input, Output> = input => ({
    c: merge(input.a, input.b),
  });

  instantiate(inputCreator, outputCreator, undefined, {
    a: 0,
    b: 1,
  });
});

test('should create model instance with custom views', () => {
  const inputCreator: InputCreator<Input> = () => ({
    a: new Subject(),
    b: new Subject(),
  });

  const outputCreator: OutputCreator<Input, Output> = input => ({
    c: merge(input.a, input.b),
  });

  const viewCreators: ViewCreators = {
    Custom: view(input => ({}), output => output),
  };

  instantiate(inputCreator, outputCreator, viewCreators, {
    a: 0,
    b: 1,
  });
});
