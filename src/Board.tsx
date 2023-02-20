import './Board.scss';

import React, { useImperativeHandle, useRef } from 'react';
import Immutable from 'immutable';
import NestedMap from './NestedMap';
import {Subway as SubwayElement} from './Subway';
import Station, { StationRef } from './Station';
import {Location, Subway, Window, Edge} from './AppData';


const styles = {
  spacing: 50,
  station: {
    radius: 15,
    strokeWidth: 4
  },
  route: {
    strokeWidth: 8,
    edgeGap: 2
  },
  routeName: {
    radius: 20
  },
  completionBonus: {
    initial: {
      width: 24,
      height: 30,
      strokeWidth: 1,
      dx: -8,
      dy: -5
    },
    subsequent: {
      width: 18,
      height: 20,
      strokeWidth: 2,
      dx: 5,
      dy: 8
    }
  },
  trainCar: {
    paddingX: 9,
    paddingY: 6,
    front: {
      cornerX: 8,
      cornerY: 15,
      width: 8,
      lightRadius: 2.5
    },
    window: {
      gap: 8,
      width: 27,
      height: 27,
      border: 2
    },
    wheels: {
      margin: 7,
      radius: 8
    },
    underTrack: {
      strokeWidth: 4,
      margin: 2,
      dashes: 1
    }
  }
};

export type BoardRef = {
  subways: () => SVGGElement | null,
  stations: () => SVGGElement | null
};

export type BoardProps = {
  subways: Immutable.Map<String, Subway>,
  windows: Immutable.Map<string, Immutable.List<Window>>,
  previewWindows: Immutable.Map<string, Immutable.List<Window>>,
  transfers: Immutable.Set<Location>,
  previewTransfers: Immutable.Set<Location>;
  stations: Immutable.Set<Location>,
  previewStations: Immutable.Set<Location>,
  selectedSubway?: string,
  selectedStation?: Location,
  subwaySelectDisabled: boolean,
  stationSelectDisabled: boolean,
  onSubwayClick?: (label:string, event:React.UIEvent) => void,
  onStationClick?: (position:Location, event:React.UIEvent) => void
};

const Board = React.forwardRef<BoardRef, BoardProps>(({
  subways, 
  windows, 
  stations,
  transfers,
  previewWindows,
  previewStations,
  previewTransfers,
  selectedSubway,
  subwaySelectDisabled=true, 
  stationSelectDisabled=true, 
  onSubwayClick,
  onStationClick
}, ref) => {


  // const stationCheckValues = Immutable.Set<Location>();
  // for (const checkedStation of stations) {
  //   stationCheckValues.set(checkedStation, (prev:any) => prev, () => true);
  // }
  // for (const mixedStation of previewStations) {
  //   stationCheckValues.set(mixedStation, () => 'mixed', () => 'mixed');
  // }

  const transferSet = new NestedMap();
  for (const checkedTransfer of transfers) {
    transferSet.set(checkedTransfer, () => true, () => true);
  }
  for (const mixedTransfer of previewTransfers) {
    transferSet.set(mixedTransfer, () => 'mixed', () => 'mixed');
  }
  
  const subwaysRef = useRef<SVGGElement>(null);
  const stationsRef = useRef<SVGGElement>(null);
  useImperativeHandle(ref, () => ({
    subways: () => subwaysRef.current,
    stations: () => stationsRef.current
  }));
  
  const stationRefs = Immutable.Map<Location, React.RefObject<StationRef>>();
  for (const subway of subways.valueSeq()) {
    for (const station of subway.route) {
      stationRefs.update(station, old => {
        if (old) {
          return old;
        }
        return React.createRef<StationRef>();
      });
    }
  }

  const overlapEntries:Iterable<[Edge, Immutable.Set<string>]> = subways.valueSeq().flatMap(subway => {
    const starts = subway.route.toSeq();
    const stops = starts.skip(1); 
    const edgePairs = starts.zip(stops) as Immutable.Seq.Indexed<[Location, Location]>;
    return edgePairs.map(([start, stop]) => [new Edge({start, stop}), Immutable.Set<string>([subway.name])]);
  });
  
  const emptyGraph = Immutable.Map<Edge, Immutable.Set<string>>();
  const edgeOverlaps = emptyGraph.withMutations(mutGraph => {
    return mutGraph.mergeWith((oldVal, newVal) => oldVal.union(newVal), overlapEntries);
  });


  const padding = 30;
  const points = subways
    .valueSeq()
    .flatMap(({route, trainCar:{x, y}}) => route.push(
      new Location({x:x-2, y}), //label
      new Location({x:x-1, y}), //points
      new Location({x, y}) //left window
    ))
    .toList();
  const xs = points.map(({x}) => x);
  const ys = points.map(({y}) => y);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  
  const [right, bottom] = [maxX, maxY].map(r => r * styles.spacing + padding);
  const [left, top] = [minX, minY].map(r => r * styles.spacing - padding);
  const viewBox = [left, top, right - left, bottom - top];

  return <svg 
    className='Board'
    version='1.1'
    baseProfile='full' 
    width='100%'
    height='100%'
    viewBox={viewBox.join(' ')} 
    xmlns='http://www.w3.org/2000/svg'
  >
    <g 
      ref={subwaysRef}
      tabIndex={-1}
      className='subways'
      role='radiogroup'
    >
      <title>Subway Select</title>
      {subways.map(subway => {
        const windowValues = windows.get(subway.name);
        const isWindowsFull = (windowValues?.size ?? 0) >= subway.numWindows;
        const checked = selectedSubway === subway.name ? 'mixed' : false;
        return <SubwayElement 
          key={subway.name}
          styles={styles}
          subway={subway}
          windows={windowValues}
          previewWindows={previewWindows?.get(subway.name)}
          edgeOverlaps={edgeOverlaps}
          checked={checked}
          disabled={subwaySelectDisabled || isWindowsFull}
          onClick={(event:React.UIEvent) => onSubwayClick?.(subway.name, event)}
        />;
      })}
    </g>

    <g
      ref={stationsRef}
      // tabIndex={-1}
      className='stations'
      role='radiogroup'
    >
      <title>Station Select</title>
      {stationRefs.toKeyedSeq().map((ref, position) => {
        const checked = stations.has(position);
        const transfer = transferSet.get(position) ?? false;
        function handleStationClick(event:React.UIEvent) {
          onStationClick?.(position, event);
        }
        return <Station 
          key={position.toString()}
          ref={ref}
          position={position}
          checked={checked as boolean}
          transfer={transfer as boolean}
          styles={styles}
          disabled={stationSelectDisabled || checked as boolean}
          onClick={handleStationClick}
        />
      })}
    </g>

  </svg>;
});

export default Board;
