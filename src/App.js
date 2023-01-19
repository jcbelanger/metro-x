import './App.css';
import React, { useState, useLayoutEffect, useRef} from 'react';
import metroCity from './metro-city.json';
import Board from './Board';
import CardMat from './CardMat';


function App() {
  const subways = Array.from(metroCity)

  const landscapeMQ = 'only screen and (min-aspect-ratio: 2 / 1) and (max-height: 50rem)';
  const isLandscapeDefault = window.matchMedia(landscapeMQ).matches;
  const [isLandscape, setIsLandscape] = useState(isLandscapeDefault);
  useLayoutEffect(() => {
    const handleMQChange = (event) => setIsLandscape(event.matches);
    const mql = window.matchMedia(landscapeMQ);
    mql.addEventListener("change", handleMQChange);
    return () => mql.removeEventListener("change", handleMQChange);
  });

  
  const deckRef = useRef();
  const [numDrawn, setNumDrawn] = useState(0);
  // const [canDraw, setCanDraw] = useState(true);
  function handleDeckActivated() {
    deckRef?.current?.blur();
    setNumDrawn(prev => prev + 1);
  };


  return <div className='App'>
    <Board subways={subways} />
    <CardMat
      ref={deckRef}
      landscape={!isLandscape}
      numDrawn={numDrawn}
      onDeckActivated={handleDeckActivated}
    />
  </div>;
}

export default App;
