import './App.scss';

import React, { useRef, useReducer } from 'react';
import Immutable from 'immutable';
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

type AppStateProps = {
  subways: Immutable.List<AppData.Subway>;
  windows: Immutable.Map<string, (string | number)[]>;
  previewWindows: Immutable.Map<string, (string | number)[]>;
  transfers: [number, number][];
  previewTransfers: [number, number][];
  stations: [number, number][],
  previewStations: [number, number][],
  selectedSubway?: string,
  selectedStation?: [number, number],
  cardDrawDisabled: boolean,
  subwaySelectDisabled: boolean,
  stationSelectDisabled: boolean,
  numDrawn: number,
  cards: Immutable.List<AppData.Card>;
};

class AppState extends Immutable.Record<AppStateProps>({
  subways: Immutable.List(),
  windows: Immutable.Map(),
  previewWindows: Immutable.Map(),
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
}) {}

function App() {
  const deckRef = useRef<DeckRef>(null);
  const boardRef = useRef<BoardRef>(null);

  const initalState:AppState = new AppState({
    subways: Immutable.List(AppData.MetroCity)
  });

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
    let nextState:AppState = prevState;

    const prevIx = prevState.cards.size - prevState.numDrawn;
    const prevCard = prevState.cards.get(prevIx);
    if (!prevCard) return nextState;

    const nextSubway = prevState.subways.find(subway => subway.name === action.name);
    if (!nextSubway) return nextState;

    const isStationFree = ([x, y]: [number, number]):boolean => prevState.stations.findIndex(([a, b]) => a === x && b === y) < 0;
    const nextFreeIx = nextSubway?.route?.findIndex(isStationFree) ?? 0;
    
    nextState = nextState.merge({
      selectedSubway: action.name,
      previewWindows: Immutable.Map({[action.name]: [prevCard.value]}),
      previewTransfers: [],
      previewStations: [],
      cardDrawDisabled: false
    });

    switch (prevCard.type) {
      case AppData.CardType.NUMBER:
      case AppData.CardType.RESHUFFLE:
        nextState = nextState.set('previewStations', [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + prevCard.value), isStationFree)]);
        break; 
      case AppData.CardType.SKIP:
        nextState = nextState.set('previewStations', nextSubway.route.slice(nextFreeIx).filter(isStationFree).slice(0, prevCard.value));
        break;
      case AppData.CardType.TRANSFER:
        nextState = nextState.set('previewStations', [...takeWhile(nextSubway.route.slice(nextFreeIx, nextFreeIx + 1), isStationFree)]);
        nextState = nextState.set('previewTransfers', [...nextState.previewStations]);
        break;
      default:
        break;
    }
    
    return nextState;
  }

  function selectStation(prevState:AppState, action:SelectStationEvent):AppState {
    return prevState.merge({
      previewStations: [action.position],
      selectedStation: action.position,
      cardDrawDisabled: false
    });
  }

  function drawCard(prevState:AppState, action:DrawCardEvent):AppState {
    let nextState:AppState = prevState.merge({
      stations: [...prevState.stations, ...prevState.previewStations],
      transfers: [...prevState.transfers, ...prevState.previewTransfers],
      previewWindows: Immutable.Map(),
      previewTransfers: [],
      previewStations: [],
      selectedStation: undefined,
      selectedSubway: undefined,
      subwaySelectDisabled: true,
      stationSelectDisabled: true,
      cardDrawDisabled: true,
      numDrawn: prevState.numDrawn + 1
    });
    
    const prevIx = prevState.cards.size - prevState.numDrawn;
    const prevCard = prevState.cards.get(prevIx);
    if (prevCard) {
      if (prevCard.type === AppData.CardType.RESHUFFLE) {
        nextState = nextState.merge({
          cards: shuffle(prevState.cards),
          numDrawn: 1
        });
      }
  
      if (prevState.selectedSubway !== undefined) {
        const prevPreviewWindows = prevState.previewWindows.get(prevState.selectedSubway, []);
        nextState = Immutable.updateIn(nextState, ['windows', prevState.selectedSubway], [], old => [...old as any[], ...prevPreviewWindows]);
      }
    }

    const nextIx = nextState.cards.size - nextState.numDrawn;
    const nextCard = nextState.cards.get(nextIx);
    if (nextCard) {
      deckRef.current?.blur();
      if (nextCard.type === AppData.CardType.FREE) {
        nextState = nextState.set('stationSelectDisabled', false);
        boardRef.current?.stations()?.focus();
      } else {
        nextState = nextState.set('subwaySelectDisabled', false);
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
