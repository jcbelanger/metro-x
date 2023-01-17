function rangeMap(n, fn) {
    let i = 0;
    return {
        [Symbol.iterator]() {
            return {
                next: () => {
                    const result = {
                        value: fn(i),
                        done: i >= n
                    };
                    i++;
                    return result;
                }
            }
        }
    };
}

function zip(...iterables) {
    const iters = iterables.map(iterable => iterable[Symbol.iterator]());
    return {
        [Symbol.iterator]() {
            return {
                next: () => {
                    let results = iters.map(iter => iter.next());
                    return {
                        value: results.map(result => result.value),
                        done: results.some(result => result.done)
                    };
                }
            }
        }
    };
}

function comparator(...keys) {
    return (a, b) => {
        for (const key of keys) {
            const compare = key(a) - key(b);
            if (compare !== 0) {
                return compare;
            }
        }
        return 0;
    };
}

export {
    rangeMap,
    zip, 
    comparator
};