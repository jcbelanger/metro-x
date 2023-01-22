function* takeWhile(iterable, predicate) {
    for (const value of iterable) {
        if (predicate(value)) {
            yield value;
        } else {
            return;
        }
    }
}

function shuffle(input) {
    const output = [...input];
    for (let i = input.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [output[i], output[j]] = [output[j], output[i]]
    }
    return output;
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
  
function* rangeMap(n, fn) {
    for (let i = 0; i < n; i++) {
        yield fn(i);
    }
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
    takeWhile,
    shuffle,
    zip,
    rangeMap,
    comparator
};