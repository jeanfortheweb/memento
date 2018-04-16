import { Model, Merge, Disconnect, ConnectCreator } from './core';
import { Subscription, Observable, Subject } from 'rxjs';

export default function connect<
  TInputA,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
  bidirectional?: false,
): Disconnect;

export default function connect<
  TInputA extends Merge<TInputA, TOutputB>,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
  bidirectional: true,
): Disconnect;

export default function connect<
  TInputA extends Merge<TInputA, TOutputB>,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
  connectCreator: ConnectCreator<
    Model<TInputA, TOutputA>,
    Model<TInputB, TOutputB>
  >,
): Disconnect;

export default function connect<
  TInputA,
  TOutputA,
  TInputB extends Merge<TInputB, TOutputA>,
  TOutputB
>(
  modelA: Model<TInputA, TOutputA>,
  modelB: Model<TInputB, TOutputB>,
  mode?,
): Disconnect {
  let subscriptions: Subscription[] = [];

  if (typeof mode === 'boolean' || mode === undefined) {
    subscriptions = subscribeTo(modelA, modelB);

    if (mode) {
      subscriptions = [...subscriptions, ...subscribeTo(modelB, modelA)];
    }
  } else {
    mode(modelA, modelB, (output: Observable<any>, input: Subject<any>) => {
      subscriptions.push(output.subscribe(input));
    });
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
