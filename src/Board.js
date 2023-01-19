import './Board.css';
import React from 'react';
import { zip } from './utils';
import NestedMap from './nested';
import Subway from './Subway';
import Station from './Station';
import SvgDefsContext, { useDefIds } from './SvgDefsContext';


function Board({subways}) {
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
        <filter id={id('faint-drop-shadow')} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3'/>
          <feOffset dx='4' dy='2' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.2'/>
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

        <filter id={id('lighting')}>
          <feGaussianBlur in='SourceAlpha' stdDeviation='5' result='blur1'/>
          <feSpecularLighting result='specOut' in='blur1' specularConstant='1.8' specularExponent='49' lightingColor='#ccc'>
            <feDistantLight azimuth='225' elevation='45'/>
          </feSpecularLighting>
          <feComposite in='SourceGraphic' in2='specOut' operator='arithmetic' k1='0' k2='1' k3='1' k4='0' result='result'/>
          <feComposite operator='atop' in2='SourceGraphic'/>
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
  </SvgDefsContext.Provider>;
}

export default Board;
