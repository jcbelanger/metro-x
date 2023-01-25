import './App.scss';
import React, { useRef, useReducer} from 'react';
import metroCity from './metro-city.json';
import Board from './Board';
import CardMat from './CardMat';
import useMatchMediaQuery from './MatchMedia';
import { shuffle, takeWhile } from './utils';


function App() {
  const subways = Array.from(metroCity);

  const deckRef = useRef();
  const boardRef = useRef();
  const isLandscape = useMatchMediaQuery('only screen and (min-aspect-ratio: 2 / 1) and (max-height: 55rem)', [subways]);

  const initalState = {
    subways,
    windows: {},
    previewWindows: {},
    transfers: [],
    previewTransfers: [],
    stations: [],
    previewStations: [],
    selectedSubway: undefined,
    selectedStation: undefined,
    cardDrawDisabled: false,
    subwaySelectDisabled: true,
    stationSelectDisabled: true,
    numDrawn: 0,
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
    ])
  };

  const [state, dispatch] = useReducer((prevState, action) => {
    switch (action.type) {
      case 'select_subway':
        return selectSubway(prevState, action);
      case 'select_station':
        return selectStation(prevState, action);
      case 'draw_card':
        return drawCard(prevState, action);
      default:
        return { ...prevState};
    }
  }, initalState);

  
  function selectSubway(prevState, action) {
    const prevIx = prevState.cards.length - prevState.numDrawn;
    const {type: prevType, value: prevValue} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};

    const isStationFree = ([x, y]) => prevState.stations.findIndex(([a, b]) => a === x && b === y) < 0;
    const nextSubway = subways.find(subway => subway.name === action.name);
    const nextFreeIx = nextSubway?.route?.findIndex(isStationFree) ?? 0;
    
    const nextState = {
      ...prevState,
      selectedSubway: action.name,
      previewWindows: {[action.name]: [prevValue]},
      previewTransfers: [],
      previewStations: [],
      cardDrawDisabled: false
    };

    switch (prevType) {
      case "number":
        nextState.previewStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevValue), isStationFree)];
        break; 
      case "skip":
        nextState.previewStations = nextSubway.route.slice(nextFreeIx).filter(isStationFree).slice(0, prevValue);
        break;
      case "reshuffle":
        nextState.previewStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevValue), isStationFree)];
        break;
      case "transfer":
        nextState.previewStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + 1), isStationFree)];
        nextState.previewTransfers = [...nextState.previewStations];
        break;
      default:
        break;
    }
    
    return nextState;
  }

  function selectStation(prevState, action) {
    return {
      ...prevState,
      previewStations: [action.position],
      selectedStation: action.position,
      cardDrawDisabled: false
    };
  }

  function drawCard(prevState, action) {
    const prevIx = prevState.cards.length - prevState.numDrawn;
    const {type: prevType} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};
    
    const nextState = {
      ...prevState,
      stations: [...prevState.stations, ...prevState.previewStations],
      windows: {...prevState.windows},
      transfers: [...prevState.transfers, ...prevState.previewTransfers],
      previewWindows: [],
      previewTransfers: [],
      previewStations: [],
      selectedStation: undefined,
      selectedSubway: undefined,
      subwaySelectDisabled: true,
      stationSelectDisabled: true,
      cardDrawDisabled: true,
      numDrawn: prevState.numDrawn + 1
    };

    if (prevType === "reshuffle") {
      nextState.cards = shuffle(prevState.cards);
      nextState.numDrawn = 1;
    }

    if (prevState.selectedSubway !== undefined) {
      const prevWindows = prevState.windows[prevState.selectedSubway] ?? [];
      const prevPreviewWindows = prevState.previewWindows[prevState.selectedSubway] ?? [];
      nextState.windows[prevState.selectedSubway] = [...prevWindows, ...prevPreviewWindows];
    }

    const nextIx = nextState.cards.length - nextState.numDrawn;
    const {type: nextType} = nextIx < nextState.cards.length ? nextState.cards[nextIx] : {};

    deckRef.current?.blur();
    if (nextType === "free") {
      nextState.stationSelectDisabled = false;
      boardRef.current?.stations()?.focus();
    } else {
      nextState.subwaySelectDisabled = false;
      boardRef.current?.subways()?.focus();
    }

    return nextState;
  }
  
  function handleDeckDraw(event) {
    event.preventDefault();
    dispatch({type: 'draw_card'});
  }

  function handleStationClick(position, event) {
    event.preventDefault();
    dispatch({type: 'select_station', position});
  }

  function handleSubwayClick(name, event) {
    event.preventDefault();
    dispatch({type: 'select_subway', name});
  }

  return <div className='App'>
    <Board
      ref={boardRef} 
      subways={state.subways}
      windows={state.windows}
      stations={state.stations}
      transfers={state.transfers}
      previewWindows={state.previewWindows}
      previewStations={state.previewStations}
      previewTransfers={state.previewTransfers}
      subwaySelectDisabled={state.subwaySelectDisabled}
      stationSelectDisabled={state.stationSelectDisabled}
      selectedSubway={state.selectedSubway}
      selectedStation={state.selectedStation}
      onSubwayClick={handleSubwayClick}
      onStationClick={handleStationClick}
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
