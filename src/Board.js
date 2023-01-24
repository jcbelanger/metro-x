import './Board.scss';
import React, { useImperativeHandle, useRef } from 'react';
import { zip } from './utils';
import NestedMap from './nested';
import Subway from './Subway';
import Station from './Station';
import SvgDefsContext, { useDefIds } from './SvgDefsContext';

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
  selectedSubway,
  transferStations,
  checkedStations,
  mixedStations,
  subwayWindows, 
  subwaySelectDisabled=true, 
  stationSelectDisabled=true, 
  onStationClick, 
  onSubwayClick
}, ref) => {

  const subwaysRef = useRef();
  const stationsRef = useRef();

  const stationCheckValues = new NestedMap();
  for (const checkedStation of checkedStations) {
    stationCheckValues.set(checkedStation, prev => prev, () => 'true');
  }
  
  for (const mixedStation of mixedStations) {
    stationCheckValues.set(mixedStation, prev => 'mixed', () => 'mixed');
  }

  const transferSet = new NestedMap();
  for (const transferStation of transferStations) {
    transferSet.set(transferStation, prev => true, () => true);
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

  const svgDefs = useDefIds(['faint-drop-shadow', 'lighten', 'lighting']);
  const {id} = svgDefs;
  return <SvgDefsContext.Provider value={svgDefs}>
    <svg 
      className='Board'
      version='1.1'
      baseProfile='full' 
      width='100%'
      height='100%'
      viewBox={viewBox} 
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>

        <filter id="subway-hover" x="-100%" y="-100%" width="300%" height="300%">
            <feBlend in="SourceGraphic" mode="hard-light" />
        </filter>

        <filter id="subway-label-hover" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="6" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="hard-light" />
        </filter>

        <animate 
          href="#subway-label-hover"
          id="asdf" 
          attributeName="stdDeviation"
          from="0"
          to="10"
          dur="1s"
          fill="freeze"
        />

        <filter id={id('faint-drop-shadow')} x='-30%' y='-30%' width='160%' height='160%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3'/>
          <feOffset dx='3' dy='2' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.4'/>
          </feComponentTransfer>
          <feBlend in='SourceGraphic' />
        </filter>

        <filter id={id('lighten')}>
          <feComponentTransfer>
            <feFuncR type='linear' slope='1.6' />
            <feFuncG type='linear' slope='1.6' />
            <feFuncB type='linear' slope='1.6' />
          </feComponentTransfer>
        </filter>
      </defs>

      <g 
        ref={subwaysRef}
        // tabIndex={-1}
        className='subways'
        role='radiogroup'
      >
        <title>Subway Select</title>
        {subways.map(subway => 
          <Subway 
            key={[subway.name, ...(subwayWindows?.[subway.name] ?? [])]}
            styles={styles}
            subway={subway}
            values={subwayWindows?.[subway.name]}
            edgeNames={edgeNames}
            checked={selectedSubway === subway.name}
            disabled={subwaySelectDisabled || (subwayWindows?.[subway.name]?.length ?? 0) >= subway.windows}
            onClick={(event) => onSubwayClick?.(subway.name, event)}
          />
        )}
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
          return <Station 
            key={[...position, checked]}
            ref={ref}
            position={position}
            checked={stationCheckValues.get(position)}
            transfer={transferSet.has(position)}
            styles={styles}
            subways={subways}
            disabled={stationSelectDisabled || checked === 'true'}
            onClick={(event) => onStationClick?.(position, event)}
          />
        })}
      </g>

    </svg>
  </SvgDefsContext.Provider>;
});

export default Board;
