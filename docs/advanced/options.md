# Configurable Models

Often you will find yourself creating models over and over again where the difference is very little. This is a perfect situation for **configurable models**.

Memento gives you the possibility to pass **options** when calling a **model creator**. These options are getting passed to:

* The **input creator** of the model.
* The **output creator** of the model.
* The **actions creator** of a view.
* The **data creator** of a view.

In every case, the **options** object is the last argument of the function.
This allows you to create very flexible models that you can reuse over and over again, especially when you combine this technique with [connections](./connections.md).

## Creating a configurable model

Let's take the example model from the [connections chapter](./connections.md):

```js
// models/filterable-list.js
import { model } from '@memento/memento';
import { combineLatest } from 'rxjs';

const inputCreator = () => ({
    list: new Subject(),
    criteria: new Subject();
});

const outputCreator = (input, options) => ({
    list: combineLatest(input.list, input.criteria).pipe(map(([list, criteria]) =>
        list.filter(item => options.predicate(item, criteria))
    ));
});

export default model(inputCreator, outputCreator);
```

Here we've created a model that expects a function as option passed, named **predicate**. It uses this function to filter the incoming list using the incoming criteria.

We can now create instances of this model and configure it:

```js
import filterableList from './models/filterable-list';

const FilteredAnimals = filterableList({
  predicate: (animal, criteria) => new RegExp(`${criteria}`).test(animal.name),
});

FilteredAnimals.input.list.next([{ name: 'Ape' }, { name: 'Snake' }]);
FilteredAnimals.input.criteria.next('Sn');
FilteredAnimals.subscribe(list => console.log(list)); // [ { name: 'Snake' }]
```

Yeah, it's that easy.

## Default configuration

You can make all or some of your options optional, of course. We're using just normal javascript features for this, like spreading:

```js
const outputCreator = (input, { predicate: () => true }) => ({
    list: combineLatest(input.list, input.criteria).pipe(map(([list, criteria]) =>
        list.filter(item => options.predicate(item, criteria))
    ));
});
```

This implementation of the output creator would never filter by default.
