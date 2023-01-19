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
    shuffle,
    zip,
    rangeMap,
    comparator
};