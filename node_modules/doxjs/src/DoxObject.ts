import { DoxArray } from "./DoxArray";
import { RuntimeEvent, DoxCallback, DoxEventsStore, DoxObjectProxy } from "./DoxInterfaces";
import { defineProperty, getKeys, isArray, isObject, isPrimary, hasProperty, isSame } from "./utils";
import DoxJS from "./index";


export class DoxObject<T> {

    private keys: string[] = [];
    private runtimeEvent: RuntimeEvent<T> = {
        isLegal: false,
        value: (store) => {}
    };
    private eventsStore: DoxEventsStore<T> = {};
    private target: T;
    private dataToProxy: T = <T>{};
    private proxy: T = <T>{};
    private root: DoxJS<any>;
    private delicate: boolean = false;

    constructor(target: T, root: DoxJS<any>) {
        this.target = target;
        this.keys = getKeys(target);
        this.root = root;
        this.init();
    }

    private init() {
        this.keys.forEach(key => {
            this.eventsStore[key] = [];
            this.proxy[key] = undefined;
            defineProperty(this.proxy, key, {
                get: () => {
                    this.root._isRelyAnyVar = true;
                    if (this.runtimeEvent.isLegal) {
                        // fix bug, dont change eventStore[key]' memery address, so using splice instead of others
                        this.eventsStore[key].forEach((f, i, a) => {
                            if (f === this.runtimeEvent.value) {
                                a.splice(i, 1);
                            }
                        });
                        this.eventsStore[key].push(this.runtimeEvent.value);
                    }
                    if ((this.dataToProxy[key] instanceof DoxObject) || (this.dataToProxy[key] instanceof DoxArray)) {
                        if (this.runtimeEvent.isLegal) {
                            this.dataToProxy[key].extendsRuntimeEvent(this.runtimeEvent);
                        }
                        return this.dataToProxy[key].observe();
                    } else if (isPrimary(this.dataToProxy[key])) {
                        return this.dataToProxy[key];
                    }
                },
                set: (newValue) => {
                    if (!isSame(this.dataToProxy[key], newValue)) {
                        if (isPrimary(newValue)) {
                            this.dataToProxy[key] = newValue;
                            this.eventsStore[key].forEach(f => f(this.root.observe()));
                        } else if (isObject(newValue)) {
                            this.dataToProxy[key] = new DoxObject(newValue, this.root);
                            this.eventsStore[key].forEach(f => {
                                this.root.subscribe(f);
                            });
                        } else if (isArray(newValue)) {
                            this.dataToProxy[key] = new DoxArray(newValue, this.root/*, this.eventsStore[key]*/);
                            this.eventsStore[key].forEach(f => {
                                this.root.subscribe(f);
                            });
                        }

                        this.root.execLonely();
                    }
                }
            });

            this.proxy[key] = this.target[key];
        });
    }


    public extendsRuntimeEvent(callback: RuntimeEvent<T>) {
        this.runtimeEvent = callback;
    }

    public observe(): T {
        return this.proxy;
    }

}
