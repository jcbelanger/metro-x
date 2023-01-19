import './App.css';
import React, { useState, useLayoutEffect } from 'react';
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
  })


  return <div className='App'>
    <Board subways={subways} />
    <CardMat landscape={!isLandscape} />
  </div>;
}

export default App;
