import React, {useId} from 'react';

export type SvgDefs = {
    url: (id:string) => string | undefined,
    id: (id:string) => string | undefined
};

export function useDefIds(ids:Iterable<string>):SvgDefs {
    const baseId = useId();
    const defIds = new Map(Array.from(ids, id => [id,  baseId + '-' + id]));
    return {
        url: id => defIds.has(id) ? `url(#${ defIds.get(id) })` : undefined,
        id: id => defIds.get(id)
    };
};

export const SvgDefsContext = React.createContext<SvgDefs>({
    url: id => undefined,
    id: id => undefined
});

export default SvgDefsContext;