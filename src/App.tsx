import './App.scss';

import React, { useRef, useReducer } from 'react';
import Board, { BoardRef } from './Board';
import CardMat, { DeckRef } from './CardMat';
import useMatchMediaQuery from './MatchMedia';
import { shuffle, takeWhile } from './utils';
import * as AppData from './AppData';


enum DispatchEventType {
  SELECT_SUBWAY,
  SELECT_STATION,
  DRAW_CARD
};

type SelectSubwayEvent = {
  type: DispatchEventType.SELECT_SUBWAY;
  name: string
};

type SelectStationEvent = {
  type: DispatchEventType.SELECT_STATION;
  position: [number, number]
}

type DrawCardEvent = {
  type: DispatchEventType.DRAW_CARD;
}

type DispatchEvent = 
  | SelectStationEvent
  | SelectSubwayEvent
  | DrawCardEvent;

  
type AppState = {
  subways: AppData.Subway[];
  windows: Record<string, (string | number)[]>;
  previewWindows: Record<string, (string | number)[]>;
  transfers: any[];
  previewTransfers: [number, number][];
  stations: [number, number][],
  previewStations: [number, number][],
  selectedSubway?: string,
  selectedStation?: [number, number],
  cardDrawDisabled: boolean,
  subwaySelectDisabled: boolean,
  stationSelectDisabled: boolean,
  numDrawn: number,
  cards: AppData.Card[];
};

function App() {
  const deckRef = useRef<DeckRef>(null);
  const boardRef = useRef<BoardRef>(null);

  const initalState:AppState = {
    subways: AppData.TubeTown,
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
    cards: shuffle(AppData.NewDeck)
  };

  const [state, dispatch] = useReducer((prevState:AppState, action:DispatchEvent):AppState => {
    switch (action.type) {
      case DispatchEventType.SELECT_SUBWAY:
        return selectSubway(prevState, action);
      case DispatchEventType.SELECT_STATION:
        return selectStation(prevState, action);
      case DispatchEventType.DRAW_CARD:
        return drawCard(prevState, action);
      default:
        return prevState;
    }
  }, initalState);

  function selectSubway(prevState:AppState, action:SelectSubwayEvent):AppState {
    const prevIx = prevState.cards.length - prevState.numDrawn;
    if (prevIx >= prevState.cards.length) return prevState;
    const prevCard = prevState.cards[prevIx];


    const isStationFree = ([x, y]: [number, number]):boolean => prevState.stations.findIndex(([a, b]) => a === x && b === y) < 0;
    const nextSubway = prevState.subways.find(subway => subway.name === action.name);
    if (!nextSubway) return prevState;
    const nextFreeIx = nextSubway?.route?.findIndex(isStationFree) ?? 0;
    
    const nextState:AppState = {
      ...prevState,
      selectedSubway: action.name,
      previewWindows: {[action.name]: [prevCard.value]},
      previewTransfers: [],
      previewStations: [],
      cardDrawDisabled: false
    };

    switch (prevCard?.type) {
      case AppData.CardType.NUMBER:
        nextState.previewStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevCard.value), isStationFree)];
        break; 
      case AppData.CardType.SKIP:
        nextState.previewStations = nextSubway.route.slice(nextFreeIx).filter(isStationFree).slice(0, prevCard.value);
        break;
      case AppData.CardType.RESHUFFLE:
        nextState.previewStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevCard.value), isStationFree)];
        break;
      case AppData.CardType.TRANSFER:
        nextState.previewStations = [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + 1), isStationFree)];
        nextState.previewTransfers = [...nextState.previewStations];
        break;
      default:
        break;
    }
    
    return nextState;
  }

  function selectStation(prevState:AppState, action:SelectStationEvent):AppState {
    return {
      ...prevState,
      previewStations: [action.position],
      selectedStation: action.position,
      cardDrawDisabled: false
    };
  }

  function drawCard(prevState:AppState, action:DrawCardEvent):AppState {
    const nextState:AppState = {
      ...prevState,
      stations: [...prevState.stations, ...prevState.previewStations],
      windows: {...prevState.windows},
      transfers: [...prevState.transfers, ...prevState.previewTransfers],
      previewWindows: {},
      previewTransfers: [],
      previewStations: [],
      selectedStation: undefined,
      selectedSubway: undefined,
      subwaySelectDisabled: true,
      stationSelectDisabled: true,
      cardDrawDisabled: true,
      numDrawn: prevState.numDrawn + 1
    };
    
    const prevIx = prevState.cards.length - prevState.numDrawn;
    if (prevIx < prevState.cards.length) {
      const prevCard = prevState.cards[prevIx];

      if (prevCard.type === AppData.CardType.RESHUFFLE) {
        nextState.cards = shuffle(prevState.cards);
        nextState.numDrawn = 1;
      }
  
      if (prevState.selectedSubway !== undefined) {
        const prevWindows = prevState.windows[prevState.selectedSubway] ?? [];
        const prevPreviewWindows = prevState.previewWindows[prevState.selectedSubway] ?? [];
        nextState.windows[prevState.selectedSubway] = [...prevWindows, ...prevPreviewWindows];
      }
    }

    const nextIx = nextState.cards.length - nextState.numDrawn;
    if (nextIx < nextState.cards.length) {
      const nextCard = nextState.cards[nextIx];

      deckRef.current?.blur();
      if (nextCard.type === AppData.CardType.FREE) {
        nextState.stationSelectDisabled = false;
        boardRef.current?.stations()?.focus();
      } else {
        nextState.subwaySelectDisabled = false;
        boardRef.current?.subways()?.focus();
      }
    }

    return nextState;
  }
  
  function handleDeckDraw(event:React.UIEvent) {
    event.preventDefault();
    dispatch({type: DispatchEventType.DRAW_CARD});
  }

  function handleStationClick(position:[number, number], event:React.UIEvent) {
    event.preventDefault();
    dispatch({type: DispatchEventType.SELECT_STATION, position});
  }

  function handleSubwayClick(name:string, event:React.UIEvent) {
    event.preventDefault();
    dispatch({type: DispatchEventType.SELECT_SUBWAY, name});
  }

  const isLandscape = useMatchMediaQuery('only screen and (min-aspect-ratio: 2 / 1) and (max-height: 55rem)', [state.subways]);

  return <>
    <div className='App'>
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
  </>
}

export default App;
