# Connections

Sooner or later, you will come into situations where data depends on other data, or, existing data needs to get extended to support new feautures. Every system has its own solutions, so does Memento.

If you have to extend or relate to an existing data model, Memento allows you to just create an new model which fits the reqirements and connect them.

Connections are created using the `connect` function and two models. You can choose to connect those models **unidirectional**, **bidirectional** or in a custom way.

## Unidirectional connections

Let's imagine that we have a model that represents a list of contacts:

```js
// models/contacts.js
import { model } from '@memento/memento';

const inputCreator = () => ({
  contacts: new Subject(),
});

const outputCreator = input => ({
  contacts: input.contacts,
});

export default model(inputCreator, outputCreator);
```

In real world applications, this model would have more options of course, like adding or removing contacts. But we keep it simple for now. We can set and retrieve the contacts. This should be fine for now.

Out of the sudden, we need to filter those contacts. We could extend our (maybe already bloated) model to support that. But we could also create a new model that accepts a list of data and some filter criteria as inputs. In return, the new model gives us a filtered list output.

```js
// models/filterable-list.js
import { model } from '@memento/memento';

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

See that we use the options parameter we [discussed before](./options.md)? We use it to accept a filter function which can process the changing criteria. Now lets connect them:

```js
// models/index.js

import contacts from './contacts';
import filterableList from './filterableList';

const Contacts = contacts();
const FilteredContacts = filterableList({
  predicate: (contact, criteria) =>
    contact.firstName.match(new RegExp(`${criteria}`)),
});

connect(Contacts, FilteredContacts);

export { Contacts, FilteredContacts };
```

First we import our **model creators**, then we create actual model instances. See how we pass our custom predicate option to the `filterableList`? Lastly, we create an **unirectional** connection between them. Well, to be honest, that could work, but it won't in this particular case.

The reason is simple. To auto connect models, the sending (the first model) and receiving (the second model) need matching inputs/outputs. The output of the contacts model is "contacts", while the input of our generic filterable list model is "list".

## Custom connections

To fix that, we skip the **bidirectional** variant of `connect` and setup the connection manually:

```js
// models/index.js

connect(Contacts, FilteredContacts, (sender, receiver, plug) => {
  plug(sender.output.contacts, receiver.input.list);
});
```

Now we passed a third option to connect, a connection creator which allows us to setup custom connections. The functions receives the sending and receiving model again, plus a third option: A function named `plug`. We use it the same way as we would use the `connect` function, but instead of models, we pass the sending output and the receiving input of each model.

## Bidirectional connections

What we have just created is namely a **unidirectional** connection, since we only pass outputs from contacts to the inputs of filterable list. If we would connect an output of the filterable list back to the contacts, we would end up in a **bidirectional** connection where the two involded models are able to talk to each other.

By default, `connect` creates **unidirectional** connections. To automatically create **bidirectional** connections, just pass `true` as third parameter to `connect`. This requires again that in and output names of each model match, though.

## Removing connections

You may feel the need to remove connections somewhere in the future. To do so, we just have to store the return value of our `connect` call:

```js
const disconnect = connect(modelA, modelB);
```

`connect` returns a function which, when invoked, disconnect all connections which has been created.

## Use cases for `connect`

If we look again at our example above, we ended up with two models. Both of them have [views](../basics/views.md) available. So we can use, for example, the `Contacts.View`-view to list all contacts, or we can use the `FilteredContacts.View` to list only the filtered contacts. Since they are connected, the filtered view will always be in sync with the actual source of data.

If we take example further, we could image that we start of with a static list of contacts to develop our features. But someday, these contacts should come from somehwere else. Yet again we can easily create a new model which may load the contacts from an external API. Then we just connect this model to the `contacts` input and we're done. Following this workflow, our app becomes scalable in a very pleasant way and none of the invovled models will ever have to know each other.
