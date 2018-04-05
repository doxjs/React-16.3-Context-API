export interface DoxCallback<T> {
    (store: T): void;
}

export interface RuntimeEvent<T> {
    isLegal: boolean,
    value: DoxCallback<T>
}

export interface DoxEventsStore<T> {
    [key: string]: DoxCallback<T>[];
}


export interface DoxActions {
    [action: string]: Function;
}

export interface DoxObjectProxy {
    [key: string]: object | boolean | number | string;
}

export interface DoxArrayProxy<T> {
    [index: number]: T;
    length: number;
}
