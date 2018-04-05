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