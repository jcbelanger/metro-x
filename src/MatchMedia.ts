import { useLayoutEffect, useState, DependencyList } from "react";


export default function useMatchMediaQuery(mediaQuery:string, deps?: DependencyList):boolean {
    const intialMatch = window.matchMedia(mediaQuery).matches;
    const [matches, setMatches] = useState(intialMatch);
    
    useLayoutEffect(() => {
      const handleMQChange = (event:MediaQueryListEvent) => setMatches(event.matches);
      const mql = window.matchMedia(mediaQuery);
      mql.addEventListener("change", handleMQChange);
      return () => mql.removeEventListener("change", handleMQChange);
    }, deps);

    return matches;
};