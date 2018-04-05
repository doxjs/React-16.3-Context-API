import { Consumer } from './context';
import * as React from 'react';

export default class App extends React.Component {
    render() {
        return (
            <Consumer>
                {
                    theme => {
                        if (theme == "Light") {
                            return (<h1 style={{ background: "white", textAlign: "center" }}>Hello world!</h1>);
                        } else {
                            return (<h1 style={{ background: "#cdcdcd", textAlign: "center" }}>Hello world!</h1>);
                        }
                    }
                }
            </Consumer>
        );
    }
}