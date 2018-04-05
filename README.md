# React@16.3 全新的Context API

## 前言
最近看了下React16.3的新文档，发现官方悄悄地改了很多东西了。其中我最感兴趣的自然就是这个全新的Context API了。所以写了这篇文章来总结分享一下。其他的变动在这篇文章里或许会提及。

## 什么是Context API
`Context API`是React提供的一种`跨节点`数据访问的方式。众所周知，React是单向数据流的，`Vue`里面的`props`也借鉴了这一思想。

但是很多时候，这种单向数据流的设定却变得不是那么友好。我们往往需要从更高层的节点获取一些数据，如果使用传统的`prop`传递数据，就需要每一层都手动地向下传递。对于层次很高的组件，这种方法十分地烦人，极大地降低了工作效率。

于是，React使用了`Context API`。`Context API`存在已久，但是旧的`Context API`存在很多问题，并且使用起来也并不是特别方便，官方并不建议使用老版本的`Context API`。于是很多开发者选择了`Redux`之类的状态管理工具。

受到`Redux`的影响，`React`在16.3.0版本中推出了全新的`Context API`。

## 一些你需要提前知道的东西

1. 众所周知，长期起来JavaScript一直没有模块系统。`nodejs`使用`require`作为弥补方法。`ECMAScript6`之后，引入了全新的`import`语法标准。`import`语法标准有个尤为重要的不同（相比较`require`），那就是：`import`导入的数据是引用的。这意味着多个文件导入同一个数据，并不是导入的拷贝，而是导入的引用。

2. react@16.3的声明文件(d.ts)貌似没有更新，意味着如果你现在使用Typescript，那么可能会报错。

3. React现在推荐使用`render props`，`render props`为组件渲染的代码复用以及代码传递提供了新的思路，其实本质上就是通过`props`传递HOC函数来控制组件的渲染。

4. 或许你曾经听过“`Context API`是用来替代`Redux`”之类的传闻，然而事实并非如此。`Redux`和`Context API`解决的问题并不一样，会造成那样的错觉可能是因为他们的使用方法有点儿一样。

5. React16.3有几个新特性，最主要的变化是Context，还有就是废除了几个生命周期，比如`ComponentWillReceiveProps`（说实话，实际项目中，这个生命周期完全可以用`ComponentWillUpdate`来替换）

6. React16.3中的refs不再推荐直接传递一个函数了，而是使用了全新的`React.createRef`来替代。当然以前的方法依旧适用，毕竟是为了兼容。

## 开始使用

### React.createContext
`createContext`用来创建一个`Context`，它接受一个参数，这个参数会作为`Context`传递的默认值。需要注意的是，如果你传入的参数是个对象，那么当你更改`Context`的时候，内部会调用`Object.is`来比较对象是否相等。这会导致一些性能上的问题。当然，这并不重要，因为大部分情况下，这点儿性能损失可以忽略。

我们看下这个例子，这是一个提供主题（Light/Dark）类型的`Context`。

```js
// context.js
import * as React from 'react';
// 默认主题是Light
export const { Provider, Consumer } = React.createContext("Light");

```
接下来我们只需要在需要的文件里`import`就行了

### Provider

`Provider`是需要使用`Context`的所有组件的根组件。它接受一个`value`作为`props`，它表示`Context`传递的值，它会修改你在创建`Context`时候设定的默认值。

```js
import { Provider } from './context';
import * as React from 'react';
import { render } from 'react-dom';
import App from './app';


const root = (
    <Provider value='Dark'>
        <App />
    </Provider>
);

render(root, document.getElementById('root'));


```

### Consumer

`Consumer`表示消费者，它接受一个`render props`作为唯一的`children`。其实就是一个函数，这个函数会接收到`Context`传递的数据作为参数，并且需要返回一个组件。

```js
// app.jsx

import { Consumer } from './context';
import * as React from 'react';

export default class App extends React.Component {
    render() {
        return (
            <Consumer>
                {
                    theme => <div>Now, the theme is { theme }</div>
                }
            </Consumer>
        )
    }
}
```

## 一些需要注意的地方

### 多层嵌套

`Context`为了确保重新渲染的快速性，React需要保证每个`Consumer`都是独立的节点。
```js
const ThemeContext = React.createContext('light');
const UserContext = React.createContext();

function Toolbar(props) {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <UserContext.Consumer>
          {user => (
            <ProfilePage user={user} theme={theme} />
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}

class App extends React.Component {
  render() {
    const {signedInUser, theme} = this.props;

    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Toolbar />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}
```

当层次更加复杂的时候，会变得很烦人。因此推荐当层次超过两层之后，创建一个自己的`render prop`或许是个不错的主意。在实际工程中，其实并不建议多层嵌套。更为适合的时，提供一对`Provier`和`Consumer`对，传递状态管理工具对应的实例就行了。

### 在生命周期中使用

在之前的`Context API`中，在一些声明周期中会暴露一个`context`的参数，以供开发者更为方便的访问。新版API并没有这个参数传递了，更为推荐的方式是直接把`Context`的值通过`props`传递给组件。具体来说，就像下面这个官方的例子这样。
```js
class Button extends React.Component {
  componentDidMount() {
    // ThemeContext value is this.props.theme
  }

  componentDidUpdate(prevProps, prevState) {
    // Previous ThemeContext value is prevProps.theme
    // New ThemeContext value is this.props.theme
  }

  render() {
    const {theme, children} = this.props;
    return (
      <button className={theme ? 'dark' : 'light'}>
        {children}
      </button>
    );
  }
}

export default props => (
  <ThemeContext.Consumer>
    {theme => <Button {...props} theme={theme} />}
  </ThemeContext.Consumer>
);
```
不像以前那样，可以直接通过`this.context`访问，新版本的`Context`只能在`render`方法里面访问。因为`Context`只暴露在`Consumer`的`render prop`里面。个人觉得这是这个版本API的一个缺点。所以只有采用上面这种折中的方式，再包装一个函数组件来封装到props里面去。相比较而言，还是麻烦了一点儿。在组件树里面多了一个函数组件，也是一个缺点。

### Consumer封装
当一个`Context`的值多个组件都在使用的时候，你需要手动地每次都写一次`Consumer`和`redner prop`。这是很烦的，程序员都是很懒的（至少我是这样），因此这个时候利用一下React的HOC来封装一下来简化这个过程。
```js
const ThemeContext = React.createContext('light');

function ThemedButton(props) {
  return (
    <ThemeContext.Consumer>
      {theme => <button className={theme} {...props} />}
    </ThemeContext.Consumer>
  );
}
```
接下来，当你需要使用`Context`的时候，就不需要在写什么`Consumer`了
```js
export default props => (
    ThemeButton(props)
);
```

### 转发refs

当你封装完一个`Consumer`之后，或许你想要用ref来获取`Consumer`里面根组件的实例或者对应的DOM。如果直接在`Consumer`上使用ref，是得不到想要的结果的。于是在React16.3里面，使用了一种全新的技术（不确定是不是16.3才引入的），叫做`转发refs` 。不仅仅用在`Context`里面，实际上，在任何你想要把`ref`传递给组件内部的子组件的时候，你都可以使用`转发refs`。

具体来说，你需要使用一个新的API：`React.forwardRef((props, ref) => React.ReactElement)`，以下面这个为例：
```js
class FancyButton extends React.Component {}

// Use context to pass the current "theme" to FancyButton.
// Use forwardRef to pass refs to FancyButton as well.
export default React.forwardRef((props, ref) => (
  <ThemeContext.Consumer>
      {
        theme => (
            <FancyButton {...props} theme={theme} ref={ref} />
        )
      }
  </ThemeContext.Consumer>
));
```
`React.forwardRef()`接受一个函数作为参数。实际上，你可以将这个函数当做一个函数组件，它的第一个参数和函数组件一样。不同的地方在于，它多了一个ref。这意味着如果你在`React.forwardRef`创建的组件上使用ref的话，它并不会直接被组件消化掉，而是向内部进行了转发，让需要消化它的组件去消化。

如果你觉得难以理解，其实这种方法完全可以用另一种方法替代。我们知道，在React中，ref并不会出现在props中，它被特殊对待。但是换个名字不就行了吗。

需要提一下的是，以前我们获取ref是传递一个函数（不推荐使用字符串，这是一个历史遗留的问题，ref会在某些情况下无法获取到正确的值。`vuejs`可以使用，不要搞混了）。但是这个过程很烦的，我们只需要把实例或者DOM赋值给对应的变量就行了，每次都写一下这个一样模板的代码，很烦人的好吗。“千呼万唤”中，React终于听到了。现在只需要`React.createRef`就可以简化这个过程了。
```js
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }
    render() {
        return <div ref={this.myRef} />;
    }
}
```
使用方法就这么简单，没什么特别的地方。

回到上面的话题，现在我们用props来实现`转发refs`的功能。
```js
class Input extends React.Component {

    reder() {
		return (
			<label>Autofocus Input:</label>
			<input ref={this.props.forwardRef} type="text" />
		)
    }

}

function forwardRef(Component, ref) {
	return (<Component forwardRef={ref} />);
}

// 使用forwardRef
let input = React.createRef();

forwardRef(Input, input);


// 当组件绑定成功之后
 input.current.focus();

```
`React.createRef`返回的值中，`current`属性表示的就是对应的DOM或者组件实例。`forwardRef`并没有什么特殊的含义，就是一个简单的props。这个用法就像是`状态提升`一样。