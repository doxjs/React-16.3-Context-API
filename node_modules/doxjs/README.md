# DoxJS

`DoxJS` is a very easy state management library, it's written in `Typescript`.

## document

* Elglish document
* [中文文档](https://github.com/doxjs/doxjs/blob/master/README_CN.md)

## Install

### yarn

```shell
yarn add doxjs
```

### npm
```shell
npm install doxjs
```

## Term

`listener` is used to monitor changes in data, and `listener` is called when the data changes. `action` is used to generate data changes. In general, data changes should not be produced in `listener`, and also in `action`, data should not be monitored.

## API

### dox = new DoxJS<T>(target: T extends object);

Generating a `DoxJS` instance, you should notice that  `target` should be an `object`, not `string`,`array`, etc.

```js
    let dox = new DoxJS({
        name: "Double Dimos",
        age: 20,
        information: {
            sex: "male",
            weight: "55kg",
            height: "1.7m"
        },
        interesting: ["game", "animate", "film", "music", "food"]
    });
```

### dox.observe(): DoxProxy;

`dox.observe()` will return a DoxProxy instance. Say again, you just need to treat `DoxProxy` as `target` which you passed to `new DoxJS(target)`.

When you change the variables on the `DoxProxy`, the subscriped function that uses these variables will be called.

For arrays, we provide a partial mutation method, which you can see in `core.ts`. You can manually call `Array.prototype` for mutable methods that are not provided.

```js
    let store = dox.observe();

    console.log(store);
    /*
    will print in the console
    {
        name: "Double Dimos",
        age: 20,
        information: {
            sex: "male",
            weight: "55kg",
            height: "1.7m"
        },
        interesting: ["game", "animate", "film", "music", "food"]
    }
    */

```


### dox.bindActions(actions: { [key: string]: Function })

`dox.bindActions(actions)` is using for binding some actions. This API needs to be used in conjunction with `dispatch`. Focus on below example.
```js

    let dox = new DoxJS({
        value: 0
    });

    /* actions should be [key:stirng]: DoxCallback */
    const actions = {
        inc: (store, value = 1) => {
            store.value += value
        },
        dec: (store, value = 1) => {
            store.value -= value;
        }
    }

    dox.bindActions(actions);
    // the you can use `dox.dispatch`, see document of `dispatch` for more information
```

### dox.dispatch(action: string, ...args: any[])

After you have called `dox.bindActions`, you can use `dispatch` to dispatch an action with some argumets. See example above. First parameter is the name of the action, followed by optional parameters. These parameters will be passed to the specified action event.

`DoxProxy` can only be obtained by `dox.observe()`. `dox` is the instance of `DoxJS`.

```js
    /* after you called `bindActions` */

    dox.subscribe((store) => {
        console.log(`now, value is ${store.value}`);
    });

    dox.dispatch("inc", 2);//now, value is 2
    dox.dispatch("dec", 3);// now, value is -1

```


### dox.bindListeners(listeners: { [key: string]: (store: T) => void });

Using for binding listeners. This API needs to be used in conjunction with `subscribe`. See below example:
```js

const listeners = {
    display: function(store) {
        // `this` is `document` here, why? see below example of second useage of `subscribe`
        this.appendChild(`<h3>${store.value}</h3>`);
    }
}

dox.bindListeners(listeners);

```
Something you should know is that `listener` shouldn't be an arrow function. Why? Because dox uses `Function.prototype.bind` to apply `this`, but arrow function can't redefine `this`.


### dox.subscribe(listener: {(store: T) => void}, excuteLater?: boolean = false);

`subscribe` a `listener`. `listener` should be an callback function. When the callback function is called, it will accept a `DoxProxy` as parameter. `DoxProxy` is same as `target`, but `DoxProxy` is redefined, you needn't know how it works. You just need treat `DoxProxy` as `target` which you passed to `new DoxJS(target)`. When will the callback function be called? When the dependent variable in the callback function changes.

```js
 // bind an `listener` no matter whether you called `bindListeners` or not.
 // you can use arrow function here
dox.subscribe((store) => {
    console.log(store.value);
});
```


`excuteLater` is a boolean, it was set up as `false` by default. If you pass `excuteLater` as `true`, `subscribe` will return a function. You can manually call the returned function. So why keep this parameter? It's easy to understand. Because when you `subscribe` a function, this function will be called immediately by default. Why? Because DoxJS needs to determine which variables are referenced in current subscribed function, so that it can be called again when these variables change.

```js
    let dox = new DoxJS({
        value: 0
    });

    dox.subscribe((store) => {
        console.log(store.value);
    }); // it will run immediately


    // it's same with codes above

    let fn = dox.subscribe((store) => {
        console.log(store.value);
    }, true); // it will not run immediately unless you call fn

    fn();

```


### dox.subscribe<C>(listenerName: string, excuteLater: boolean = false, context: C);

This API needs to be used in conjunction with `bindListeners`.

There are two methods of calling `subscribe`. If first parameter is an callback function, it means that you subscribe a listener. If first parameter is a string, `subscribe` will try to search the callback function that corresponds to this `listenerName`. Where to search it? That's the useage of `bindListeners`.

The third parameter is using for binding context for callback function. It is valid only when the first parameter is `ListenerName`. This parameter works when you want to use the `this` variable in the callback function. See example of `bindListeners`.

```js
// this API should be called after you called `bindListeners`
// focus on the third parameter, now you can understand why `this` in callback function named `display` is document
dox.subscribe("display", false, document);
```

### dox.subscribe(callback: Function, excuteLater?: boolean = false);

Callback function don't rely on any variable in `DoxProxy`, and `doxjs` will not pass `store` to the callback function. And the callback function will excute when any variable of `DoxProxy` changes. As if it relied on all variables of `DoxProxy`.
```js
    // you can see, the callback function don't rely on any variable
    // and it will be called when any variable changes
    dox.subscribe(() => {
        console.log(`data changed at ${(new Date()).toLocaleString()}`);
    });
```

## an example
a tiny example showing useage of `DoxJS`, [click here](https://github.com/doxjs/doxjs/blob/master/src/test.ts)
