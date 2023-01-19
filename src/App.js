import './App.css';
import React, { useRef, useReducer} from 'react';
import metroCity from './metro-city.json';
import Board from './Board';
import CardMat from './CardMat';
import useMatchMediaQuery from './MatchMedia';
import { shuffle } from './utils';


function App() {
  const deckRef = useRef();
  const boardRef = useRef();

  const initalState = {
    subways: Array.from(metroCity),
    cards: shuffle([
      {type: 'number', value: 3},
      {type: 'number', value: 3},
      {type: 'number', value: 3},
      {type: 'number', value: 4},
      {type: 'number', value: 4},
      {type: 'number', value: 4},
      {type: 'number', value: 5},
      {type: 'number', value: 5},
      {type: 'reshuffle', label:'Re-Shuffle ↻', value: 6},
      {type: 'free', label: 'Free', labelOffset: '30', value: '⭘'},
      {type: 'transfer', label: 'Transfer', value: '✖'},
      {type: 'transfer', label: 'Transfer', value: '✖'},
      {type: 'skip', label: 'Skip', labelOffset: '30', value: 2},
      {type: 'skip', label: 'Skip', labelOffset: '30', value: 2},
      {type: 'skip', label: 'Skip', labelOffset: '30', value: 3}
    ]),
    numDrawn: 0,
    drawDisabled: false
  };

  const [state, dispatch] = useReducer((prevState, action) => {
    switch (action.type) {
      case 'draw_card':
        const drawnIx = prevState.cards.length - prevState.numDrawn - 1;
        const drawnCard = prevState.cards[drawnIx];
        console.log(drawnCard);

        boardRef?.current?.focus();
        return {
          ...prevState,
          numDrawn: (prevState.numDrawn + 1) % (prevState.cards.length + 1),
          // drawDisabled: true
        };
      default:
        return { ...prevState};
    }
  }, initalState);

  
  function handleDeckDraw() {
    dispatch({type: 'draw_card'});
  };

  const isLandscape = useMatchMediaQuery('only screen and (min-aspect-ratio: 2 / 1) and (max-height: 50rem)');

  return <div className='App'>
    <Board
      ref={boardRef} 
      subways={state.subways} 
    />
    <CardMat
      ref={deckRef}
      landscape={!isLandscape}
      cards={state.cards}
      numDrawn={state.numDrawn}
      drawDisabled={state.drawDisabled}
      onDeckDraw={handleDeckDraw}
    />
  </div>;
}

export default App;
