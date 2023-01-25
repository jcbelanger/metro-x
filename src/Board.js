import './Board.scss';
import React, { useImperativeHandle, useRef } from 'react';
import { zip } from './utils';
import NestedMap from './nested';
import Subway from './Subway';
import Station from './Station';


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

const Board = React.forwardRef(({
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

  const subwaysRef = useRef();
  const stationsRef = useRef();

  const stationCheckValues = new NestedMap();
  for (const checkedStation of stations) {
    stationCheckValues.set(checkedStation, prev => prev, () => 'true');
  }
  for (const mixedStation of previewStations) {
    stationCheckValues.set(mixedStation, prev => 'mixed', () => 'mixed');
  }

  const transferSet = new NestedMap();
  for (const checkedTransfer of transfers) {
    transferSet.set(checkedTransfer, prev => true, () => true);
  }
  for (const mixedTransfer of previewTransfers) {
    transferSet.set(mixedTransfer, prev => true, () => true);
  }
  
  useImperativeHandle(ref, () => ({
    subways: () => subwaysRef.current,
    stations: () => stationsRef.current
  }));
  
  const stationRefs = new NestedMap();
  for (const subway of subways) {
    for (const xy of subway.route) {
      stationRefs.set(xy, prev => prev, () => React.createRef());
    }
  }

  const edgeNames = new NestedMap();
  for (const subway of subways) {
    const edges = zip(subway.route, subway.route.slice(1));
    for (const edge of edges) {
      const key = edge.flat();
      edgeNames.set(key, prev => prev.add(subway.name), () => new Set([subway.name]));
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
    viewBox={viewBox} 
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
        const checked = selectedSubway === subway.name ? 'mixed' : 'false';
        return <Subway 
          key={subway.name}
          styles={styles}
          subway={subway}
          windows={windowValues}
          previewWindows={previewWindows?.[subway.name]}
          edgeNames={edgeNames}
          checked={checked}
          disabled={subwaySelectDisabled || isWindowsFull}
          onClick={(event) => onSubwayClick?.(subway.name, event)}
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
        const checked = stationCheckValues.get(position) ?? 'false';
        const transfer = transferSet.get(position);
        return <Station 
          key={position}
          ref={ref}
          position={position}
          checked={checked}
          transfer={transfer}
          styles={styles}
          subways={subways}
          disabled={stationSelectDisabled || checked === 'true'}
          onClick={(event) => onStationClick?.(position, event)}
        />
      })}
    </g>

  </svg>;
});

export default Board;
