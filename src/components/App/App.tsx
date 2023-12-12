import './App.scss';

import React, { useRef, useReducer, useCallback } from 'react';
import Immutable from 'immutable';
import Board, { BoardRef, StationRef, SubwayRef } from '../Board/Board';
import CardMat, { DeckRef } from '../CardMat/CardMat';
// import Score from '../Score/Score';
import {Location, Subway, SubwayName, Window, Card, CardType, NewDeck, Edge, MetroCity} from '../../common/AppData';
import shuffle from '../../util/immutable-shuffle';
import useMatchMediaQuery from '../../hooks/MatchMedia';


enum DispatchEventType {
  SELECT_SUBWAY,
  SELECT_STATION,
  DRAW_CARD,
  NEW_GAME,
}

type SelectSubwayEvent = {
  type: DispatchEventType.SELECT_SUBWAY;
  name: SubwayName
};

type SelectStationEvent = {
  type: DispatchEventType.SELECT_STATION;
  position: Location
};

type DrawCardEvent = {
  type: DispatchEventType.DRAW_CARD;
};

type NewGameEvent = {
  type: DispatchEventType.NEW_GAME;
};

type DispatchEvent = 
  | SelectStationEvent
  | SelectSubwayEvent
  | DrawCardEvent
  | NewGameEvent;

type AppStateProps = {
  subways: Immutable.Map<SubwayName, Subway>,
  windows: Immutable.Map<SubwayName, Immutable.List<Window>>,
  previewWindows: Immutable.Map<SubwayName, Immutable.List<Window>>,
  transfers: Immutable.Set<Location>;
  previewTransfers: Immutable.Set<Location>;
  stations: Immutable.Set<Location>,
  previewStations: Immutable.Set<Location>,
  selectedSubway?: SubwayName,
  selectedStation?: Location,
  cardDrawDisabled: boolean,
  subwaySelectDisabled: boolean,
  stationSelectDisabled: boolean,
  numDrawn: number,
  cards: Immutable.List<Card>;
};

class AppState extends Immutable.Record<AppStateProps>({
  subways: Immutable.Map(),
  windows: Immutable.Map(),
  previewWindows: Immutable.Map(),
  transfers: Immutable.Set(),
  previewTransfers: Immutable.Set(),
  stations: Immutable.Set(),
  previewStations: Immutable.Set(),
  selectedSubway: undefined,
  selectedStation: undefined,
  cardDrawDisabled: false,
  subwaySelectDisabled: true,
  stationSelectDisabled: true,
  numDrawn: 0,
  cards: NewDeck
}) {}


function App() {
  const deckRef = useRef<DeckRef>(null);
  const boardRef = useRef<BoardRef>(null);

  const initalState:AppState = new AppState({
    subways: MetroCity,
    cards: shuffle(NewDeck)
  });

  const [state, dispatch] = useReducer((prevState:AppState, action:DispatchEvent):AppState => {
    switch (action.type) {
      case DispatchEventType.SELECT_SUBWAY:
        return selectSubway(prevState, action);
      case DispatchEventType.SELECT_STATION:
        return selectStation(prevState, action);
      case DispatchEventType.DRAW_CARD:
        return drawCard(prevState);
      case DispatchEventType.NEW_GAME:
        return newGame(prevState);
    }
  }, initalState);

  function newGame(prevState:AppState):AppState {
    return new AppState({
      subways: prevState.subways,
      cards: shuffle(NewDeck)
    });
  }

  function selectSubway(prevState:AppState, action:SelectSubwayEvent):AppState {
    const prevIx = prevState.cards.size - prevState.numDrawn;
    const prevCard = prevState.cards.get(prevIx);
    if (!prevCard) return prevState;

    const selectedSubway = prevState.subways.get(action.name);
    if (!selectedSubway) return prevState;

    return prevState.withMutations(nextState => {
      nextState = nextState.merge({
        selectedSubway: action.name,
        previewWindows: Immutable.Map({[action.name]: Immutable.List([prevCard.value])}),
        previewTransfers: Immutable.Set(),
        previewStations: Immutable.Set(),
        cardDrawDisabled: false
      });
      
      const wasStationFree = (loc:Location) => !prevState.stations.has(loc);

      switch (prevCard.type) {
        case CardType.NUMBER:
        case CardType.RESHUFFLE:
          nextState = nextState.set('previewStations', selectedSubway.route.toSeq()
            .skipUntil(wasStationFree)
            .take(prevCard.value)
            .takeWhile(wasStationFree)
            .toSet()
          );
          break; 
        case CardType.SKIP:
          nextState = nextState.set('previewStations', selectedSubway.route.toSeq()
            .skipUntil(wasStationFree)
            .filter(wasStationFree)
            .take(prevCard.value)
            .toSet()
          );
          break;
        case CardType.TRANSFER:
          // eslint-disable-next-line no-case-declarations
          const transfer = selectedSubway.route.toSeq()
            .skipUntil(wasStationFree)
            .take(1)
            .toSet();
          nextState = nextState.set('previewStations', transfer);
          nextState = nextState.set('previewTransfers', transfer);
          break;
      }
      
      return nextState;
    });
  }

  function selectStation(prevState:AppState, event:SelectStationEvent):AppState {
    return prevState.merge({
      previewStations: Immutable.Set([event.position]),
      selectedStation: event.position,
      cardDrawDisabled: false
    });
  }

  function drawCard(prevState:AppState):AppState {
    return prevState.withMutations(nextState => {
      nextState = nextState.merge({
        stations: prevState.stations.concat(prevState.previewStations),
        transfers: prevState.transfers.concat(prevState.previewTransfers),
        previewWindows: Immutable.Map(),
        previewTransfers: Immutable.Set(),
        previewStations: Immutable.Set(),
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
        if (prevCard.type === CardType.RESHUFFLE) {
          nextState = nextState.merge({
            cards: shuffle(prevState.cards),
            numDrawn: 1
          });
        }
    
        if (prevState.selectedSubway) {
          const prevPreviewWindows = prevState.previewWindows.get(prevState.selectedSubway, Immutable.List());
          nextState = Immutable.updateIn(nextState, ['windows', prevState.selectedSubway], Immutable.List<Window>(), old => (old as Immutable.List<Window>).concat(prevPreviewWindows));
        }
      }
  
      const nextIx = nextState.cards.size - nextState.numDrawn;
      const nextCard = nextState.cards.get(nextIx);
      if (nextCard) {
        deckRef.current?.blur();
        if (nextCard.type === CardType.FREE) {
          nextState = nextState.set('stationSelectDisabled', false);
          boardRef.current?.stations()?.focus();
        } else {
          nextState = nextState.set('subwaySelectDisabled', false);
          boardRef.current?.subways()?.focus();
        }
      }
  
      return nextState;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNewGame = useCallback((event:React.UIEvent) => {
    event.preventDefault();
    dispatch({type: DispatchEventType.NEW_GAME});
  }, [dispatch]);

  const handleDeckDraw = useCallback((event:React.UIEvent) => {
    event.preventDefault();
    dispatch({type: DispatchEventType.DRAW_CARD});
  }, [dispatch]);

  const handleStationClick = useCallback((position:Location, ref:React.RefObject<StationRef>, event:React.UIEvent) => {
    event.preventDefault();
    ref?.current?.focus();
    dispatch({type: DispatchEventType.SELECT_STATION, position});
  }, [dispatch]);

  const handleSubwayClick = useCallback((name:SubwayName, ref:React.RefObject<SubwayRef>, event:React.UIEvent) => {
    event.preventDefault();
    ref?.current?.focus();
    dispatch({type: DispatchEventType.SELECT_SUBWAY, name});
  }, [dispatch]);

  const graphs = (function buildGraphs() {
    const edgeSetEntries:Iterable<[Edge, Immutable.Set<SubwayName>]> = state.subways.valueSeq().flatMap(subway => {
      const starts = subway.route.toSeq();
      const stops = starts.skip(1);
      const edgePairs = starts.zip(stops) as Immutable.Seq.Indexed<[Location, Location]>;
      return edgePairs.map(([start, stop]) => [new Edge({start, stop}), Immutable.Set<SubwayName>([subway.name])]);
    });
    
    const emptyEdgeSets = Immutable.Map<Edge, Immutable.Set<SubwayName>>();
    const edgeSets = emptyEdgeSets.withMutations(mutGraph => {
      return mutGraph.mergeWith((oldVal, newVal) => oldVal.union(newVal), edgeSetEntries);
    });

    const vertexSetEntries:Iterable<[Location, Immutable.Set<SubwayName>]> = state.subways.valueSeq().flatMap(subway => {
      return subway.route.toSeq().map(station => [station, Immutable.Set<SubwayName>([subway.name])]);
    });

    const emptyVertexSets = Immutable.Map<Location, Immutable.Set<SubwayName>>();
    const vertexSets = emptyVertexSets.withMutations(mutGraph => {
      return mutGraph.mergeWith((oldVal, newVal) => oldVal.union(newVal), vertexSetEntries);
    });

    return {
      edgeSets,
      vertexSets
    };
  })();
  
  // function isRouteComplete(subway:Subway):boolean {
  //   return subway.route.every(station => [state.stations, state.transfers].some(set => set.has(station)));
  // }
  
  // const scores = (function calculateScores() {
  //   const completedSubways = state.subways.filter(isRouteComplete);
  //   return {
  //     completed: completedSubways.reduce((accum, subway) => accum + subway.routeCompletionBonus[0], 0),
  //     transfers: 2 * state.transfers.reduce((accum, station) => accum + graphs.vertexSets.get(station, Immutable.Set()).size, 0),
  //     empty: graphs.vertexSets.size - state.stations.size - state.transfers.size
  //   };
  // })();
  

  const isLandscape = useMatchMediaQuery('only screen and (min-aspect-ratio: 2 / 1) and (max-height: 55rem)');

  return <div className='App'>
      <Board
        ref={boardRef} 
        subways={state.subways}
        edgeSets={graphs.edgeSets}
        vertexSets={graphs.vertexSets}
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
      {/* <div>
        <Score {...scores} />
        <button onClick={handleNewGame}>New Game</button>
      </div> */}
  </div>;
}

export default App;
