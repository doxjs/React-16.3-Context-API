import { DoxObject } from "./DoxObject";
import { isObject, warn, getKeys, hasProperty, _toString, isFunction } from "./utils";
import { RuntimeEvent, DoxActions, DoxCallback } from "./DoxInterfaces";

Array.prototype.forEach = function<T>(callback: (item: T, index?: number, array?: T[]) => void) {
    for (let i = 0; i < this.length; i++) {
        callback.call(this, this[i], i, this);
    }
}

export default class DoxJS<T> {
    private runtimeEvent: RuntimeEvent<T>;
    private sourceObject: DoxObject<T>;
    private actions: DoxActions;
    private listeners: {
        [key: string]: DoxCallback<T>
    };
    private loneListeners: Function[] = [];

    public _isRelyAnyVar: boolean = false;

    constructor(target: T) {
        if (!isObject(target)) {
            warn(`DoxJS only accept object as argument`);
        } else {
            this.sourceObject = new DoxObject(target, this);
        }
    }

    public execLonely() {
        this.loneListeners.forEach(f => f());
    }

    public subscribe<C>(listener: DoxCallback<T> | string, excuteLater: boolean = false, context?: C) {
        if (isFunction(listener)) {
            this.runtimeEvent = {
                isLegal: true,
                value: <DoxCallback<T>>listener
            };

            let fn = () => {
                // check if rely any var
                this._isRelyAnyVar = false;

                this.sourceObject.extendsRuntimeEvent(this.runtimeEvent);
                (<DoxCallback<T>>listener)(this.sourceObject.observe());
                this.runtimeEvent.isLegal = false;

                // not rely any var
                if (!this._isRelyAnyVar) {
                    this.loneListeners.push(<Function>listener);
                }
                this._isRelyAnyVar = false;
            }

            return (excuteLater ? fn : fn());
        } else if(_toString.call(listener) === '[object String]') {
            if (hasProperty(this.listeners, listener)) {
                if (context) {
                    this.subscribe(this.listeners[<string>listener].bind(context), excuteLater);
                } else {
                    this.subscribe(this.listeners[<string>listener], excuteLater);
                }
            }
        } else {
            warn(`First parameter of subscribe should be Function or String`);
        }
    }

    public bindListeners(listeners: { [key: string]: DoxCallback<T> } = {}) {
        this.listeners = listeners;
    }

    public observe(): T {
        return this.sourceObject.observe();
    }

    public bindActions(actions: DoxActions = {}) {
        this.actions = actions;
    }

    public dispatch(action: string, ...args: any[]) {
        if (hasProperty(this.actions, action)) {
            this.actions[action](this.sourceObject.observe(), ...args);
        }
    }
}
