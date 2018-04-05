import { DoxArray } from "./DoxArray";
import { isArray } from './utils';

export function push<T>(...items: T[]): number {
    return Array.prototype.push.call(this, ...items);
}

export function pop<T>(): T | undefined {
    return Array.prototype.pop.call(this);
}

export function shift<T>(): T | undefined {
    return Array.prototype.shift.call(this);
}

export function unshift<T>(...items: T[]) {
    return Array.prototype.unshift.call(this, ...items);
}

export function splice<T>(start: number = 0, deleteCount: number = 0, ...append: T[]): T[] | undefined {
    return Array.prototype.splice.call(this, start, deleteCount, ...append);
}

export function reverse() {
    return Array.prototype.reverse.call(this);
}

export function sort<T>(compareFn?: (a: T, b: T) => number) {
    return Array.prototype.sort.call(this, compareFn);
}

export function map<T>(callbackfn: (value: T, index: number, array: T[]) => T[]) {
    return Array.prototype.map.call(this, callbackfn);
}

export function forEach<T>(callbackfn: (value: T, index: number, array: T[]) => void) {
    //console.log(this);
    return Array.prototype.forEach.call(this, callbackfn)
}

export function every<T>(callbackfn: (value: T, index: number, array: T[]) => boolean): boolean {
    return Array.prototype.every.call(this, callbackfn);
}

export function some<T>(callbackfn: (value: T, index: number, array: T[]) => boolean): boolean {
    return Array.prototype.some.call(this, callbackfn);
}

export function filter<T, S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S): S[] {
    return Array.prototype.filter.call(this, callbackfn);
}

export function reduce<T, U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U {
    return Array.prototype.reduce.call(this, callbackfn, initialValue);
}

export function concat<T>(...items: (T | ConcatArray<T>)[]): T[] {
    items.forEach(item => {
        if (isArray(item)) {
            (<any[]>item).forEach(i => {
                this.push(i);
            });
        } else {
            this.push(item);
        }
    });
    return this;
}

export function join(separator?: string): string {
    return Array.prototype.join.call(this, separator);
}
export const methods = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort", "map", "forEach", "every", "some", "filter", "reduce", "concat", "join"];
