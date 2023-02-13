function* takeWhile<T>(iterable:Iterable<T>, predicate:(value:T) => boolean):Iterable<T> {
    for (const value of iterable) {
        if (predicate(value)) {
            yield value;
        } else {
            return;
        }
    }
}

function shuffle<T>(input: T[]): T[] {
    const output = [...input];
    for (let i = input.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [output[i], output[j]] = [output[j], output[i]]
    }
    return output;
}

function zip<T>(...iterables:Iterable<T>[]):Iterable<T[]> {
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
  
function* rangeMap<T>(n:number, fn:(i:number) => T):Iterable<T> {
    for (let i = 0; i < n; i++) {
        yield fn(i);
    }
}

function comparator<T>(...keys:((x:T) => number)[]): (a:T, b:T) => number {
    return (a:T, b:T):number => {
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