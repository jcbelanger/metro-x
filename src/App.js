import './App.css';
import React, { useRef, useReducer} from 'react';
import metroCity from './metro-city.json';
import Board from './Board';
import CardMat from './CardMat';
import useMatchMediaQuery from './MatchMedia';
import { shuffle, takeWhile } from './utils';


function App() {
  const deckRef = useRef();
  const boardRef = useRef();

  const subways = Array.from(metroCity);

  const initalState = {
    subways,
    checkedStations: [],
    transferStations: [],
    subwayValues: Object.fromEntries(subways.map(subway => [subway.name, []])),
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
        const prevIx = prevState.cards.length - prevState.numDrawn;
        const {type: prevType, value: prevValue} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};

        const wasStationFree = ([x, y]) => prevState.checkedStations.findIndex(([a, b]) => a === x && b === y) < 0;
        const prevSubway = subways.find(subway => subway.name === prevState.selectedSubway);
        const prevFreeIx = prevSubway?.route?.findIndex(wasStationFree) ?? 0;
        
        const nextState = {
          ...prevState,
          subwayValues: {...prevState.subwayValues},
          selectedStation: undefined,
          selectedSubway: undefined,
          subwaySelectDisabled: true,
          stationSelectDisabled: true,
          cardDrawDisabled: true
        };

        switch (prevType) {
          case "number":
            nextState.subwayValues[prevState.selectedSubway] = [...prevState.subwayValues[prevState.selectedSubway], prevValue];
            nextState.numDrawn = prevState.numDrawn + 1;
            const newChecksNumber = takeWhile(prevSubway.route.slice(prevFreeIx, prevFreeIx + prevValue), wasStationFree);
            nextState.checkedStations = [...prevState.checkedStations, ...newChecksNumber];
            break; 
          case "skip":
            nextState.subwayValues[prevState.selectedSubway] = [...prevState.subwayValues[prevState.selectedSubway], prevValue];
            nextState.numDrawn = prevState.numDrawn + 1;
            const newChecksSkip = prevSubway.route.slice(prevFreeIx, -1).filter(wasStationFree).slice(0, prevValue);
            nextState.checkedStations = [...prevState.checkedStations, ...newChecksSkip];
            break;
          case "reshuffle":
            nextState.subwayValues[prevState.selectedSubway] = [...prevState.subwayValues[prevState.selectedSubway], prevValue];
            nextState.cards = shuffle(prevState.cards);
            nextState.numDrawn = 1;
            const newChecksReshuffle = takeWhile(prevSubway.route.slice(prevFreeIx, prevFreeIx + prevValue), wasStationFree);
            nextState.checkedStations = [...prevState.checkedStations, ...newChecksReshuffle];
            break;
          case "transfer":
            nextState.subwayValues[prevState.selectedSubway] = [...prevState.subwayValues[prevState.selectedSubway], prevValue];
            nextState.numDrawn = prevState.numDrawn + 1;
            const newChecksTransfer = Array.from(takeWhile(prevSubway.route.slice(prevFreeIx, prevFreeIx + 1), wasStationFree));
            nextState.checkedStations = [...prevState.checkedStations, ...newChecksTransfer];
            nextState.transferStations = [...prevState.transferStations, ...newChecksTransfer];
            break;
          case "free":
            nextState.checkedStations = [...prevState.checkedStations, prevState.selectedStation];
            nextState.numDrawn = prevState.numDrawn + 1;
            break;
          default: //First card
            nextState.numDrawn = prevState.numDrawn + 1;
            break;
        }

        const nextIx = nextState.cards.length - nextState.numDrawn;
        const {type: nextType } = nextIx < nextState.cards.length ? nextState.cards[nextIx] : {};

        // deckRef.current?.blur();
        switch (nextType) {
          case "number":
          case "skip":
          case "reshuffle":
          case "transfer":
            nextState.subwaySelectDisabled = false;
            // boardRef.current?.subways()?.focus();
            break;
          case "free":
            nextState.stationSelectDisabled = false;
            // boardRef.current?.stations()?.focus();
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
      checkedStations={state.checkedStations}
      transferStations={state.transferStations}
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
