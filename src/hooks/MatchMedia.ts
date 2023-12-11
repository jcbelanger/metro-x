import { useLayoutEffect, useState } from "react";


export default function useMatchMediaQuery(mediaQuery:string):boolean {
    const [matches, setMatches] = useState(window.matchMedia(mediaQuery).matches);
    
    useLayoutEffect(() => {
      const mql = window.matchMedia(mediaQuery);
      const handleMqlChange = (event:MediaQueryListEvent) => setMatches(event.matches);
      mql.addEventListener("change", handleMqlChange);
      return () => mql.removeEventListener("change", handleMqlChange);
    }, [mediaQuery]);

    return matches;
}