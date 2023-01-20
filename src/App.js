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
    selectedSubway: undefined,
    selectedStation: undefined,
    cardDrawDisabled: false,
    subwaySelectDisabled: true,
    stationSelectDisabled: true
  };

  const [state, dispatch] = useReducer((prevState, action) => {
    switch (action.type) {
      case 'select_subway':
        console.log(`Selected subway ${action.name}`);
        return {
          ...prevState,
          selectedSubway: action.name,
          cardDrawDisabled: false
        };
      case 'select_station':
        console.log(`Selected station ${action.position}`);
        return {
          ...prevState,
          selectedStation: action.position,
          cardDrawDisabled: false
        };
      case 'draw_card':
        const prevIx = prevState.cards.length - prevState.numDrawn;
        const {type: prevType, value: prevValue} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};

        const stateChanges = Object.create(null);
        switch (prevType) {
          case "number":
          case "skip":
            stateChanges.numDrawn = prevState.numDrawn + 1;
            console.log(`Apply ${prevType} ${prevValue} on ${prevState.selectedSubway}`);
            break;
          case "reshuffle":
            stateChanges.cards = shuffle(prevState.cards);
            stateChanges.numDrawn = 1;
            console.log(`Apply ${prevType} ${prevValue} on ${prevState.selectedSubway}`);
            break;
          case "transfer":
          case "free":
            stateChanges.numDrawn = prevState.numDrawn + 1;
            console.log(`Apply ${prevType} ${prevValue} on ${prevState.selectedStation}`)
            break;
          default:
            console.log(`First card`)
            stateChanges.numDrawn = prevState.numDrawn + 1;
            break;
        }
        
        const nextState = {
          ...prevState,
          ...stateChanges,
          subwaySelectDisabled: true,
          stationSelectDisabled: true,
          cardDrawDisabled: true
        };

        const nextIx = nextState.cards.length - nextState.numDrawn;
        const {type: nextType } = nextIx < nextState.cards.length ? nextState.cards[nextIx] : {};

        switch (nextType) {
          case "number":
          case "skip":
          case "reshuffle":
          case "transfer":
            nextState.subwaySelectDisabled = false;
            break;
          case "free":
            nextState.stationSelectDisabled = false;
            break;
          default:
            nextState.cardDrawDisabled = false;
            break;
        }

        deckRef?.current?.blur();
        boardRef?.current?.focus();

        return nextState;
      default:
        return { ...prevState};
    }
  }, initalState);
  
  function handleDeckDraw(event) {
    event.preventDefault();
    dispatch({ type: 'draw_card' });
  };

  function handleStationSelect(position, event) {
    event.preventDefault();
    dispatch({type: 'select_station', position});
  }

  function handleSubwaySelect(name, event) {
    event.preventDefault();
    dispatch({type: 'select_subway', name});
  }

  const isLandscape = useMatchMediaQuery('only screen and (min-aspect-ratio: 2 / 1) and (max-height: 50rem)');

  return <div className='App'>
    <Board
      ref={boardRef} 
      subways={state.subways}
      subwaySelectDisabled={state.subwaySelectDisabled}
      stationSelectDisabled={state.stationSelectDisabled}
      onStationClick={handleStationSelect}
      onSubwayClick={handleSubwaySelect}
    />
    <CardMat
      ref={deckRef}
      landscape={!isLandscape}
      cards={state.cards}
      numDrawn={state.numDrawn}
      cardDrawDisabled={state.cardDrawDisabled}
      onDeckDraw={handleDeckDraw}
    />
  </div>;
}

export default App;
