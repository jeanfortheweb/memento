# Models

Models in Memento have the following characteristics:

* Each model has an input map and an output map which are filled with observables.
* An output map can also be a single output observable.
* Models can decide to skip input creation, output creation or- technically - both. The latter wouldn't make sense though.

Models are created using the `model` function. To be precise, `model` creates a model creator, which then allows you to create instances of that model.

To create a **model creator**, you have to provide an **input creator** and an **output creator**.

## Input Creators

An input creator is simply a function which returns an object of [Subjects](https://github.com/ReactiveX/rxjs/blob/master/doc/subject.md) provided by [rxjs](https://github.com/ReactiveX/rxjs). These are later used to push input values to the model:

```js
import { Subject } from 'rxjs';

const inputCreator = () => ({
  x: new Subject(),
  y: new Subject(),
});
```

There is really nothing more to it. You can define as much inputs as you like, as long as they contain **Subject** instances.

## Output Creators

An **output creator** is very much like input creators. But instead of returning rxjs Subject instances, they receive the input map of the **input creator** to create a map of output observables using this inputs. Since **inputs** and **outputs** are nothing more than **Observables**, you can of course map, filter and transform your outputs as you like.

It's also allowed to return a single observable from the output creator instead of a map.

```js
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const outputCreator = input => ({
  x: input.x.pipe(startWith(0)),
  y: input.y.pipe(startWith(0)),
  z: combineLatest(input.x, input.y).pipe(map(([x, y]) => x * y), startWith(0)),
});
```

Notice the usage of the [startWith operator](https://github.com/ReactiveX/rxjs/blob/master/doc/operators.md). That ensures that [subscribers](https://github.com/ReactiveX/rxjs/blob/master/doc/subscription.md) later on will receive an initial value, even if no input has been yet received. Theoretically, you could achieve the same when using [BehaviorSubject](https://github.com/ReactiveX/rxjs/blob/master/doc/subject.md#behaviorsubject) for inputs instead.

## Compose and use the Model

Now that we have an **input creator** and an **output creator**, we can compose our **model creator** from it. Then, we can create instances from this model using this **model creator**.

```js
import { model } from '@memento/memento';

const multiplier = model(inputCreator, outputCreator);
const myMultiplier = multiplier();
```

To see whats happening when we interact with the model, we have to subscribe to it's output(s). Then we can send values to it's input(s). When you subscribe to a model output, you will always receive the latest known value right away.

If you're no longer insterested in an output, just unsubscribe from it.

```js
const subscription = myMultiplier.subscribe(value => {
  console.log(value);
});

myMultiplier.input.x.next(1);
myMultiplier.input.y.next(5);
myMultiplier.input.x.next(2);

subscription.unsubscribe();

// console.log =>
// 0
// 0
// 5
// 10
```

## Summary

This is pretty much everything you need to know to make basic usage of models in Memento. As you can see, this API is pretty close to models in **MVVM** design patterns where the **model** and **controller** is represented in one object. The big difference here is that our models are reactive by nature.

Next, we should take a look at [views](./views.md), since models without a view are pretty boring.
