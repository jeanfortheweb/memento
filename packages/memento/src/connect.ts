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
  bidirectional?: false,
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
  let subscriptions = subscribeTo(modelA, modelB);

  if (bidirectional) {
    subscriptions = [...subscriptions, ...subscribeTo(modelB, modelA)];
  }

  return () => {
    subscriptions.forEach(subscription => subscription.unsubscribe());
  };
}

function subscribeTo(modelA: Model, modelB: Model): Subscription[] {
  return Object.keys(modelB.input)
    .filter(name => modelA.output[name])
    .map(name => modelA.output[name].subscribe(modelB.input[name]));
}
