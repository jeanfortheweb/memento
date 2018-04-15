import model from './model';
import connect from './connect';

import { InputCreator, OutputCreator } from './core';
import { Subject, combineLatest, Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

type InputA = {
  a: number;
  b: number;
};

type OutputA = {
  c: number;
};

type InputB = {
  c: number;
  h: number;
};

type OutputB = {
  f: number;
  a: number;
  b: number;
};

const inputCreatorA: InputCreator<InputA> = () => ({
  a: new Subject(),
  b: new Subject(),
});

const outputCreatorA: OutputCreator<InputA, OutputA> = input => ({
  c: combineLatest(input.a, input.b).pipe(map(([a, b]) => a + b), startWith(0)),
});

const inputCreatorB: InputCreator<InputB> = () => ({
  c: new Subject(),
  h: new Subject(),
});

const outputCreatorB: OutputCreator<InputB, OutputB> = input => ({
  f: input.c.pipe(map(c => c + 10), startWith(0)),
  a: input.h,
  b: input.h,
});

const modelCreatorA = model(inputCreatorA, outputCreatorA);
const modelCreatorB = model(inputCreatorB, outputCreatorB);

const modelA = modelCreatorA();
const modelB = modelCreatorB();

function getOutputValue<T>(output$: Observable<T>): Promise<T> {
  return new Promise(resolve => {
    const subscription = output$.subscribe(value => {
      resolve(value);
    });

    subscription.unsubscribe();
  });
}

test('should connect models unidirectional', async () => {
  const disconnect = connect(modelA, modelB);

  const outputBefore = await getOutputValue(modelB.output.f);

  expect(outputBefore).toEqual(0);

  modelA.input.a.next(5);
  modelA.input.b.next(5);

  const outputAfter = await getOutputValue(modelB.output.f);

  expect(outputAfter).toEqual(20);

  disconnect();

  modelA.input.a.next(5);
  modelA.input.b.next(5);

  const outputAfterDisconnect = await getOutputValue(modelB.output.f);

  expect(outputAfterDisconnect).toEqual(20);
});

test('should connect models bidirectional', async () => {
  const disconnect = connect(modelA, modelB, true);

  const outputBefore = await getOutputValue(modelB.output.f);

  expect(outputBefore).toEqual(20);

  modelB.input.h.next(1);

  const outputAfter = await getOutputValue(modelB.output.f);

  expect(outputAfter).toEqual(12);

  disconnect();

  modelA.input.a.next(5);
  modelA.input.b.next(5);

  const outputAfterDisconnect = await getOutputValue(modelB.output.f);

  expect(outputAfterDisconnect).toEqual(12);
});
