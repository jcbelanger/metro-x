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
    freeStations: [],
    subwayValues: {},
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
    const prevIx = prevState.cards.length - prevState.numDrawn;
    const {type: prevType, value: prevValue} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};

    switch (action.type) {
      case 'select_subway':
        return {
          ...prevState,
          selectedSubway: action.name,
          cardDrawDisabled: false
        };
      case 'select_station':
        return {
          ...prevState,
          selectedStation: action.position,
          cardDrawDisabled: false
        };
      case 'draw_card':
        const prevSelectValues = prevState.subwayValues[prevState.selectedSubway] || [];

      
        const nextState = {
          ...prevState,
          selectedStation: undefined,
          selectedSubway: undefined,
          subwaySelectDisabled: true,
          stationSelectDisabled: true,
          cardDrawDisabled: true
        };

        switch (prevType) {
          case "number":
            nextState.subwayValues[prevState.selectedStation] = [...prevSelectValues, prevValue];
            nextState.numDrawn = prevState.numDrawn + 1;
            break; 
          case "skip":
            nextState.subwayValues[prevState.selectedStation] = [...prevSelectValues, prevValue];
            nextState.numDrawn = prevState.numDrawn + 1;
            break;
          case "reshuffle":
            nextState.subwayValues[prevState.selectedStation] = [...prevSelectValues, prevValue];
            nextState.cards = shuffle(prevState.cards);
            nextState.numDrawn = 1;
            break;
          case "transfer":
            nextState.subwayValues[prevState.selectedStation] = [...prevSelectValues, prevValue];
            nextState.numDrawn = prevState.numDrawn + 1;
            break;
          case "free":
            nextState.freeStations = [...prevState.freeStations, prevState.selectedStation];
            nextState.numDrawn = prevState.numDrawn + 1;
            break;
          default: //First card
            nextState.numDrawn = prevState.numDrawn + 1;
            break;
        }

        const nextIx = nextState.cards.length - nextState.numDrawn;
        const {type: nextType } = nextIx < nextState.cards.length ? nextState.cards[nextIx] : {};

        deckRef.current?.blur();
        switch (nextType) {
          case "number":
          case "skip":
          case "reshuffle":
          case "transfer":
            nextState.subwaySelectDisabled = false;
            boardRef.current?.subways()?.focus();
            break;
          case "free":
            nextState.stationSelectDisabled = false;
            boardRef.current?.stations()?.focus();
            break;
          default:
            break;
        }

        return nextState;
      default:
        return { ...prevState};
    }
  }, initalState);
  
  function handleDeckDraw(event) {
    event.preventDefault();
    dispatch({ type: 'draw_card' });
  };

  function handleStationClick(position, event) {
    event.preventDefault();
    dispatch({type: 'select_station', position});
  }

  function handleSubwayClick(name, event) {
    event.preventDefault();
    dispatch({type: 'select_subway', name});
  }

  const isLandscape = useMatchMediaQuery('only screen and (min-aspect-ratio: 2 / 1) and (max-height: 50rem)', []);

  return <div className='App'>
    <Board
      ref={boardRef} 
      subways={state.subways}
      freeStations={state.freeStations}
      subwayValues={state.subwayValues}
      subwaySelectDisabled={state.subwaySelectDisabled}
      stationSelectDisabled={state.stationSelectDisabled}
      selectedStation={state.selectedStation}
      selectedSubway={state.selectedSubway}
      onStationClick={handleStationClick}
      onSubwayClick={handleSubwayClick}
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
