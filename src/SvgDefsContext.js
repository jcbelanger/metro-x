
import React, {useId} from 'react';

const SvgDefsContext = React.createContext({
    url: (id) => undefined,
    id: (id) => undefined
});

function useDefIds(ids) {
    const baseId = useId();
    const defIds = new Map(Array.from(ids, id => [id,  baseId + '-' + id]));
    return {
        url: (id) => defIds.has(id) ? `url(#${ defIds.get(id) })` : undefined,
        id: (id) => defIds.get(id)
    };
}

export {
    SvgDefsContext as default,
    useDefIds
};