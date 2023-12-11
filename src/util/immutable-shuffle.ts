
import {List} from 'immutable';


export default function shuffle<T>(input: List<T>): List<T> {
    return input.withMutations(output => {
        for (let i = output.size - 1; i >= 1; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp:T = output.get(i) as T;
            output = output
              .set(i, output.get(j) as T)
              .set(j, temp);
        }
    });
}
