import { useLayoutEffect, useState } from "react";


export default function useMatchMediaQuery(mediaQuery, deps) {
    const intialMatch = window.matchMedia(mediaQuery).matches;
    const [matches, setMatches] = useState(intialMatch);
    
    useLayoutEffect(() => {
      const handleMQChange = (event) => setMatches(event.matches);
      const mql = window.matchMedia(mediaQuery);
      mql.addEventListener("change", handleMQChange);
      return () => mql.removeEventListener("change", handleMQChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return matches;
};