export default class NestedMap {

    constructor() {
        this.data = new Map();
    }

    *[Symbol.iterator]() {
        function *step(keys, parent) {
            if (!(parent instanceof Map)) {
                yield [keys, parent];
                return;
            }
            for (const [key, child] of parent.entries()) {
                for (const result of step(keys.concat([key]), child)) {
                    yield result;
                }
            }
        };
        for (const result of step([], this.data)) {
            yield result;
        }
    }

    *keys() {
        for (const [key] of this) {
            yield key;
        }
    }

    *values() {
        for (const [ , value] of this) {
            yield value;
        }
    }

    has(keys) {
        var value = this.data;
        for (const key of keys) {
            if (!value.has(key)) {
                return false;
            }
            value = value.get(key);
        }
        return true;
    }
    
    get(keys) {
        var value = this.data;
        for (const key of keys) {
            if (!value.has(key)) {
                return undefined;
            }
            value = value.get(key);
        }
        return value;
    }
    
    set(keys, combine, initial) {
        const lastData = keys.slice(0, -1).reduce((prevData, key) => {
            if (prevData.has(key)) {
                return prevData.get(key);
            } else {
                const nextData = new Map();
                prevData.set(key, nextData);
                return nextData;
            }
        }, this.data);
    
        const lastKey = keys[keys.length - 1];
    
        let lastValue;
        if (lastData.has(lastKey)) {
            lastValue = combine(lastData.get(lastKey))
        } else {
            lastValue = initial();
        }
    
        lastData.set(lastKey, lastValue);
        return lastValue;
    }
};