import './Board.scss';

import React, { useImperativeHandle, useRef } from 'react';
import { zip } from './utils';
import NestedMap from './NestedMap';
import Subway from './Subway';
import Station, { StationRef } from './Station';
import * as AppData from './AppData';


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
  subways: AppData.Subway[];
  windows: Record<string, (string | number)[]>;
  previewWindows: Record<string, (string | number)[]>;
  transfers: any[];
  previewTransfers: [number, number][];
  stations: [number, number][],
  previewStations: [number, number][],
  selectedSubway?: string,
  selectedStation?: [number, number],
  subwaySelectDisabled: boolean,
  stationSelectDisabled: boolean,
  onSubwayClick?: (label:string, event:React.UIEvent) => void
  onStationClick?: (position:[number, number], event:React.UIEvent) => void
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


  const stationCheckValues = new NestedMap();
  for (const checkedStation of stations) {
    stationCheckValues.set(checkedStation, (prev:any) => prev, () => true);
  }
  for (const mixedStation of previewStations) {
    stationCheckValues.set(mixedStation, () => 'mixed', () => 'mixed');
  }

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
  
  const stationRefs = new NestedMap();
  for (const subway of subways) {
    for (const xy of subway.route) {
      stationRefs.set(xy, (prev:React.RefObject<StationRef>) => prev, () => React.createRef<StationRef>());
    }
  }

  const edgeNames = new NestedMap();
  for (const subway of subways) {
    const edges = zip(subway.route, subway.route.slice(1));
    for (const edge of edges) {
      const key = edge.flat();
      edgeNames.set(key, (prev:any) => prev.add(subway.name), () => new Set([subway.name]));
    }
  }

  const padding = 30;
  const points = subways.flatMap(({route, trainCar:[x, y]}) => [[x-2, y], [x-1, y], [x, y], ...route]);
  const xs = points.map(([x, y]) => x);
  const ys = points.map(([x, y]) => y);
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
        const windowValues = windows?.[subway.name];
        const isWindowsFull = (windowValues?.length ?? 0) >= subway.numWindows;
        const checked = selectedSubway === subway.name ? 'mixed' : false;
        return <Subway 
          key={subway.name}
          styles={styles}
          subway={subway}
          windows={windowValues}
          previewWindows={previewWindows?.[subway.name]}
          edgeNames={edgeNames}
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
      {Array.from(stationRefs, ([position, ref]) => {
        const checked = stationCheckValues.get(position) ?? false;
        const transfer = transferSet.get(position) ?? false;
        return <Station 
          key={position.join(',')}
          ref={ref}
          position={position as [number, number]}
          checked={checked as boolean}
          transfer={transfer as boolean}
          styles={styles}
          disabled={stationSelectDisabled || checked as boolean}
          onClick={(event:React.UIEvent) => onStationClick?.(position as [number, number], event)}
        />
      })}
    </g>

  </svg>;
});

export default Board;
