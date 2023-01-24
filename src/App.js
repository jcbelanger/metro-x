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
    subwayWindows: {},
    mixedWindows: {},
    checkedTransfers: [],
    mixedTransfers: [],
    checkedStations: [],
    mixedStations: [],
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
        // return {
        //   ...prevState,
        //   selectedSubway: undefined,
        //   selectedStation: undefined,
        //   subwaySelectDisabled: false,
        //   stationSelectDisabled: false,
        //   numDrawn: (prevState.numDrawn + 1) % (prevState.cards.length + 1)
        // };
        return drawCard(prevState, action);
      default:
        return { ...prevState};
    }
  }, initalState);

  
  function selectSubway(prevState, action) {const prevIx = prevState.cards.length - prevState.numDrawn;
    const {type: prevType, value: prevValue} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};

    const isStationFree = ([x, y]) => prevState.checkedStations.findIndex(([a, b]) => a === x && b === y) < 0;
    const nextSubway = subways.find(subway => subway.name === action.name);
    const nextFreeIx = nextSubway?.route?.findIndex(isStationFree) ?? 0;
    
    const nextState = {
      ...prevState,
      selectedSubway: action.name,
      mixedTransfers: [],
      mixedStations: [],
      cardDrawDisabled: false
    };

    switch (prevType) {
      case "number":
        nextState.mixedStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevValue), isStationFree)];
        break; 
      case "skip":
        nextState.mixedStations = nextSubway.route.slice(nextFreeIx, -1).filter(isStationFree).slice(0, prevValue);
        break;
      case "reshuffle":
        nextState.mixedStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevValue), isStationFree)];
        break;
      case "transfer":
        nextState.mixedStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + 1), isStationFree)];
        nextState.mixedTransfers = nextState.mixedStations;
        break;
      default:
        break;
    }
    
    return nextState;
  }

  function selectStation(prevState, action) {
    return {
      ...prevState,
      mixedStations: [action.position],
      selectedStation: action.position,
      cardDrawDisabled: false
    };
  }

  function drawCard(prevState, action) {
    const prevIx = prevState.cards.length - prevState.numDrawn;
    const {type: prevType, value: prevValue} = prevIx < prevState.cards.length ? prevState.cards[prevIx] : {};
    
    const nextState = {
      ...prevState,
      subwayWindows: {...prevState.subwayWindows},
      checkedStations: [...prevState.checkedStations, ...prevState.mixedStations],
      mixedStations: [],
      checkedTransfers: [...prevState.checkedTransfers, ...prevState.mixedTransfers],
      mixedTransfers: [],
      selectedStation: undefined,
      selectedSubway: undefined,
      subwaySelectDisabled: true,
      stationSelectDisabled: true,
      cardDrawDisabled: true,
      numDrawn: prevType === "reshuffle" ? 1 : prevState.numDrawn + 1
    };

    if (prevState.selectedSubway) {
      const prevSubwayWindows = prevState.subwayWindows?.[prevState.selectedSubway] ?? [];
      nextState.subwayWindows[prevState.selectedSubway] = [...prevSubwayWindows, prevValue];
    }

    const nextIx = nextState.cards.length - nextState.numDrawn;
    const {type: nextType } = nextIx < nextState.cards.length ? nextState.cards[nextIx] : {};

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
    dispatch({ type: 'draw_card' });
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
      checkedStations={state.checkedStations}
      mixedStations={state.mixedStations}
      checkedTransfers={state.checkedTransfers}
      mixedTransfers={state.mixedTransfers}
      subwayWindows={state.subwayWindows}
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
