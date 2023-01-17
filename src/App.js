import './App.css';
import React, { useState } from 'react';
import { zip, comparator } from './utils';
import metroCity from './metro-city.json';
import NestedMap from './nested';
import Subway from './Subway';
import Station from './Station';

function App() {
  // eslint-disable-next-line no-unused-vars
  const [subways, setSubways] = useState(Array.from(metroCity));
  // eslint-disable-next-line no-unused-vars
  const [styles, setStyles] = useState({
    spacing: 50,
    station: {
      radius: 15,
      strokeWidth: 4
    },
    route: {
      strokeWidth: 8,
      edgeGap: 2
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
  });

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

  function handleStationClick(position) {
    const stationRef = stationRefs.get(position);
    stationRef?.current?.focus();
  }

  const stationWidth = 2 * (styles.station.radius + styles.station.strokeWidth);
  const points = subways.flatMap(subway => [subway.trainCar, ...subway.route]);
  const xs = points.map(([x, y]) => x);
  const ys = points.map(([x, y]) => y);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const [right, bottom] = [maxX, maxY].map(r => r * styles.spacing + stationWidth);
  const [left, top] = [minX, minY].map(r => r * styles.spacing - stationWidth);
  const viewBox = [left, top, right - left, bottom - top];

  return (
    <svg version='1.1' baseProfile='full' width='100%' height='100%' viewBox={viewBox} xmlns='http://www.w3.org/2000/svg'>
      <defs>

        <filter id="train-car-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="4" dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" />
        </filter>

        <filter id='train-car-window-border'>
          <feComponentTransfer>
            <feFuncR type='linear' slope='1.6' />
            <feFuncG type='linear' slope='1.6' />
            <feFuncB type='linear' slope='1.6' />
          </feComponentTransfer>
        </filter>

      </defs>

      <g className='subways'>
        {subways.map(subway => 
          <Subway 
            key={subway.name}
            styles={styles}
            subway={subway}
            edgeNames={edgeNames}
          />
        )}
      </g>

      <g className='stations'>
        {Array.from(stationRefs, ([position, ref]) => 
          <Station 
            key={position}
            ref={ref}
            position={position}
            styles={styles}
            subways={subways}
            onClick={handleStationClick}
          />
        )}
      </g>
    </svg>
  );
}


export default App;
