# DoxJS

`DoxJS`是一个简单的状态管理工具，它使用`Typescript`编写。

## 文档

* [English document](https://github.com/doxjs/doxjs/)
* 中文文档

## 安装
### yarn

```shell
yarn add doxjs
```

### npm
```shell
npm install doxjs
```
## 术语
`listener`用于监听数据变化，在对应数据变化的时候会自动调用。`action`用于产生数据变化。`listener`中不应该发生数据变化，`action`中不应该监听数据变动。

## API

### dox = new DoxJS<T>(target: T extends object);
创建一个dox实例，值得注意的是，`target`需要是一个`object`。
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
返回一个代理对象，这个代理对象其实就是`subscribe`的回调函数所接受的参数。你完全可以把它当做`target`对待。在`DoxProxy`在对数据进行更改，`DoxJS`会智能地调用那些依赖了（或者说使用了）这些变量的回调函数。此外，`DoxJS`对数组的几个方法进行了想要式子处理，你可以在`core.ts`里查看所有的变异数组方法。如果你需要其他的遍历方法，那么请手动调用`Array.prototype`上的方法。

另外，`DoxProxy`可以响应数据的变化，需要注意的是，`DoxJS`对于数据变化的认知应该是类型相同的，比如你不应该将一个`string`赋值成为`number`。

最后一点需要注意的地方是，`DoxJS`不会响应属性的添加、删除。因此，使用`delete`是一个不好的操作。

```js
    let store = dox.observe();

    console.log(store);
    /*
    console里面会显示
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

绑定一些`actions`。这些绑定的`actions`会在`dispatch`是调用。`actions`应该是一些函数，这些函数第一个参数是`store`，后面的参数是你在`dispatch`时传递的参数。
```js

    let dox = new DoxJS({
        value: 0
    });

    /* actions必须是一个[key:stirng]: DoxCallback的对象 */
    const actions = {
        inc: (store, value = 1) => {
            store.value += value
        },
        dec: (store, value = 1) => {
            store.value -= value;
        }
    }

    dox.bindActions(actions);
    //接下来你就可以使用`dispatch`了，详见`dispatch`的文档
```

### dox.dispatch(action: string, ...args: any[])

配合`bindActions`使用，调用已经绑定的`actions`。
```js
    /* 调用了`bindActions`之后 */

    dox.subscribe((store) => {
        console.log(`now, value is ${store.value}`);
    });

    dox.dispatch("inc", 2);//now, value is 2
    dox.dispatch("dec", 3);// now, value is -1

```


### dox.bindListeners(listeners: { [key: string]: (store: T) => void });
用于绑定`listener`， 这个方法需要配合`subscribe`来使用，请看下面的例子：
```js

const listeners = {
    display: function(store) {
        // `this`就是`document`, 为什么? 详见`subscribe`的第二种用法
        this.appendChild(`<h3>${store.value}</h3>`);
    }
}

dox.bindListeners(listeners);

```
需要注意的是，在上面这个例子中，`display`不应该用箭头函数。这是因为doxjs内部使用了`Function.prototype.bind`来绑定`this`变量，而箭头函数不起作用。

### dox.subscribe(callback: (store: T) => void, excuteLater: boolean = false);
`dox`是上面所创建的`DoxJS`实例，`subscribe`用于监听一个事件。它接收两个参数。第一个参数是一个回调函数，这个回调函数需要接收一个`store`作为参数。`store`与`target`具有相似的数据形式，`target`也就是你在实例化的时候传递的参数。当然，`store`与`target`是不一样的，但是你完全可以把它们当做同一个来对待。

这个回调函数里面，你如果使用了`store`参数上的某个变量，那么当这个变量发生改变时，`doxjs`会智能地调用这个回调函数，并且传递变化后的`store`给它。

```js
 // bind an `listener` no matter whether you called `bindListeners` or not.
 // you can use arrow function here
dox.subscribe((store) => {
    console.log(store.value);
});
```

第二个参数是一个布尔型变量，从他的名字你应该不难发现，它是控制这个回调函数在初始化的时候会不会立即执行的。为什么要这样呢？这是因为`doxjs`的内部，在`subscribe`的时候，`doxjs`需要确定你传递的`callback`中使用了`store`上的哪些变量，所以它必须运行一下你传递进入的`callback`。如果你不想立即执行，只需要在`subscribe`时，传入第二个参数为`true`，那么`subscribe`会返回一个函数，当你调用这个函数的时候，再执行对应的回调函数。也就是说，不传递第二个参数实际上和将第二个参数设置为`true`，并且立即执行它所返回的函数是一样的作用，并没有什么特殊的地方。这是出于性能考虑的，至于原因，你需要了解`React`的渲染步骤。你完全可以忽略这个参数。给个例子方便理解：

```js
    let dox = new DoxJS({
        value: 0
    });

    dox.subscribe((store) => {
        console.log(store.value);
    }); // 这里会立即执行


    // 和下面的代码一样的效果

    let fn = dox.subscribe((store) => {
        console.log(store.value);
    }, true); // 这里并不会立即执行，除非你调用了fn

    fn();

```

### dox.subscribe<C>(listenerName: string, excuteLater: boolean = false, context?: C);

这个API需要配合`bindListeners`来使用，你可以查看`bindListeners`的例子来了解它的使用。区别于`subscribe`的另一种用法，这种调用方式需要提供第三个参数，也就是对应`listener`中`this`变量。

```js

//这个API应该在`bindListeners`调用之后使用
//注意第三个参数，这个参数对应的就是上面`display`这个回调函数里面的`this`变量
dox.subscribe("display", false, document);
```

`subscribe`的两种方式本质上是一致的，无论第一个参数是回调函数还是字符串，本质上子内部最后都是`subscribe`一个回调函数。之所以提供第二种调用方式，这是为了使得体验更好。


### dox.subscribe(callback: Function, excuteLater?: boolean = false);

`doxjs@3.2.0`新增的功能：当你`subscribe`的回调函数中没有使用传入的`store`变量，换句话说，它不依赖任何`DoxProxy`上的变量，那么该回调函数会响应所有的数据变动。意思是，`DoxProxy`上任何数据变化都会调用这个函数。就仿佛它依赖了所有的变量一样。
```js
    // 这里的回调函数并没有依赖任何变量
    // 但是会在任何变量发生改变时调用
    dox.subscribe(() => {
        console.log(`data changed at ${(new Date()).toLocaleString()}`);
    });
```

## 一个例子
一个小例子，但是展示了`DoxJS`的用法。[点击这里](https://github.com/doxjs/doxjs/blob/master/src/test.ts)
