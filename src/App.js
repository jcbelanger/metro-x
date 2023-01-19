import './App.css';
import React, { useState } from 'react';
import metroCity from './metro-city.json';
import Board from './Board';
import CardDeck from './CardDeck';


function App() {
  // eslint-disable-next-line no-unused-vars
  const [subways, setSubways] = useState(Array.from(metroCity));
  return <div className='App'>
    <Board subways={subways} />
    <CardDeck />
  </div>;
}

export default App;
