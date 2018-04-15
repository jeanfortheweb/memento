# Views

Views in Memento are react component classes by nature.
They are created using so called **view creators** which in turn are bound to model instances. That means that each model instance in memento has it's own view component classes bound to it.

## Default Views

By default, when you don't define any **view creators** on a model, Memento will create three default views for you:

* **View:** A simple view component passing inputs and outputs of your model 1:1.
* **ActionView:** A view component that passes only the inputs of your model.
* **DataView:** A view component that passes only the outputs of your model 1:1.


## Defining a View

To define a view, we have to use the `view` function from Memento. To be precise again, `view` does not create a component, it creates a **view creator**. Therefore, the `view` function works almost identical to the `model` function. The only thing that really changes are the semantics.

To create a **view creator**, you have to provide an **action creator** and a **data creator**, but we call them **mapInputToActions** and **mapOutputToData**.

### Action Creators (mapInputToActions)

About **action creators**:

* Each action creator receives the **input map** of the model currently bound.
* Each action creator has to return a map of function which should send values to the given inputs. Other values are not permitted.

```js
const mapInputToActions = input => ({
  onChangeX: event => input.x.next(event.target.value),
  onChangeY: event => input.y.next(event.target.value),
});
```

As you can see, we've created two simple functions that just forward the value of the incoming event to our model inputs. That makes these action very easy to use in views, since we can directly assign them as event handlers.

### Data Creators (mapOutputToData)

About **data creators**:

* Each data creator receives the **output map** of the model currently bound.
* Each data creator can either return a map of observables or a single observable. Other values are not permitted.
* Data creators can make transformations to the outputs which are meaningful for the view, but not the model itself.

```js
const mapOutputToData = output => ({
  x: output.x,
  y: output.y,
  result: output.z,
});
```

In this case, we just forward the values from the **x** and **y** output to the view. Also, we rename the **z** output to **result**.

Now we can combine these to create a **view creator**:

```js
import { view } from '@memento/memento';

const form = view(mapInputToActions, mapOutputToData);
```

As you can see, this is almost identical to the **model creation api** from the previous chapter. Only the semantics have changed to fit those of a view.

## Bind the View to a Model

Now that we have a view creator, we have to bind it to the actual model to make use of it. This can happen in different ways:

* **Model Creation Time:** View creators bound at model creation time are automatically created when an instance of the model is created. That means, if you bind view creators on model level, each instance of that model will also have these views bound to it.
* **Model Instantiation Time:** View creators defined at model instantiation time are unique to that instance of the model. If the view name conflicts with a view name which was created at **model creation time**, it get's replaced.
* **Neither:** When you don't bind views at all, Memento will create default views for you when you instantiate a model.

Let's bind our view on an instance for now. We assume that we've stored our **multiplier model creator** from the previous chapter at **./models/multiplier.js** and our custom **view creator** at **./views/form**:

```js
import multiplier from './models/multiplier';
import form from './views/form';

const MyMultiplier = multiplier(null, {
  Form: form,
});
```

You can ignore the **null** argument for now. This could be an options object passed to the model, but we will discuss this in another chapter.

Noticed the upper case naming of **MyMultiplier** and **Form**? This has very good reasons, since the model is autmatically our component namespace which we will use in jsx.

## Use the View.

We have a model instance, the model has a custom view creator bound to it, let's that now!

The instance of our model is now enriched by a new property that has the same name as we passed in the **view creator map**: **Form**

```js
console.log(typeof MyMultiplier.Form); // function
```

This is an actual react component, ready to be used. About view components in Memento:

* Each view component is bound to the instantiated model.
* Each view component expects a [**render prop** ](https://reactjs.org/docs/render-props.html) as only child.
* Each view component does only rerender in two cases:
  _ The props of the view component changed.
  _ The output data of the model changed.

Let's write some JSX finally:

```jsx
import React from 'react';
import { render } from 'react-dom';
import multiplier from './models/multiplier';
import form from './views/form';

const MyMultiplier = multiplier(null, {
  Form: form,
});

render(
  <MyMultiplier.Form>
    {(actions, data) => (
      <>
        <input type="text" onChange={actions.onChangeX} value={data.x} /> *
        <input type="text" onChange={actions.onChangeY} value={data.y} />
        = {data.result}
      </>
    )}
  </MyMultiplier.Form>,
  document.getElementById('app'),
);
```

The **render prop** of a Memento view component class always receives the same set of arguments:

* **actions:** The actions mapped by the **action creator/mapInputToActions**.
* **data:** The data mapped by the **data creator/mapOutputToData**.

Each of those can be empty. That depends on the model and/or the **view creator** output.

In turn, the function has to produce an output that can be rendered by react. This way, you can reuse the view always the a different presentational part.

That's it. When we would run this example, we would be able to change the x and y inputs and see the multipication result.

## Make Use of Views

To emphasize the power behind this architecture, we create yet another **view creator**. This time, we skip the input mapping and just map a single data output for the result:

```js
import { view } from '@memento/memento';

const mapOutputToData = output => output.z;

export default view(null, mapOutputToData);
```

Then we add it to our **view creator** map:

```js
import multiplier from './models/multiplier';
import form from './views/form';
import result from './views/result';

const MyMultiplier = multiplier(null, {
  Form: form,
  Result: result,
});
```

Now we have two views available: **Form** and **Result**.
This allows us to place the form presentation somewhere, and also render the result in a complete different place. The important part here is, that the **Result** view will only rerender when **output.z** delivers a different value:

```jsx
import React from 'react';
import { render } from 'react-dom';
import multiplier from './models/multiplier';
import form from './views/form';
import result from './views/result';

const MyMultiplier = multiplier(null, {
  Form: form,
  Result: result,
});

const MultiplierForm = () => (
  <MyMultiplier.Form>
    {(actions, data) => (
      <>
        <input type="text" onChange={actions.onChangeX} value={data.x} /> *
        <input type="text" onChange={actions.onChangeY} value={data.y} />
      </>
    )}
  </MyMultiplier.Form>
);

const MultiplierResult = () => (
  <MyMultiplier.Result>
    {(actions, result) => <span>Result: {result}</span>}
  </MyMultiplier.Result>
);

render(
  <>
    <MultiplierForm />
    <MultiplierResult />
  </>,
  document.getElementById('app'),
);
```

Let's finish up by moving the binding of the **view creators** to **model creation time**:

```js
// ./models/multiplier
import { model } from '@memento/memento';
import form from '../views/form';
import result from '../views/result';

// ...inputCreator, outputCreator, ...etc

export default model(inputCreator, outputCreator, {
  Form: form,
  Result: result,
});
```

Now, whenever you create an instance of the **multiplier** model, they have the **Form** and **Result** view available by default.
If you still define them at **instantation time**, you will overwrite these defaults, allowing you to customize these views when needed.

