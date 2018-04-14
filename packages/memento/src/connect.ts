import { Model, Merge, Connection } from './core';
import { Subscription } from 'rxjs';

export default function connect<
  TInputA,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
): Connection;

export default function connect<
  TInputA extends Merge<TInputA, TOutputB>,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
  bidirectional: true,
): Connection;

export default function connect<
  TInputA,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
  bidirectional?,
): Connection {
  let subscriptions: Subscription[] = Object.keys(modelB.input)
    .filter(name => modelA.output[name])
    .map(name => modelA.output[name].subscribe(modelB.input[name]));

  if (bidirectional) {
    subscriptions = [
      ...subscriptions,
      ...Object.keys(modelA.input)
        .filter(name => modelB.output[name])
        .map(name => modelB.output[name].subscribe(modelA.input[name])),
    ];
  }

  return () => {
    subscriptions.forEach(subscription => subscription.unsubscribe());
  };
}
