import './App.css';
import React, { useState } from 'react';
import { zip } from './utils';
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

  return (
    <svg version='1.1' baseProfile='full' width='100%' height='100%' viewBox={viewBox} xmlns='http://www.w3.org/2000/svg'>
      <defs>

        <filter id='faint-drop-shadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3'/>
          <feOffset dx='4' dy='2' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.2'/>
          </feComponentTransfer>
          <feBlend in='SourceGraphic' />
        </filter>

        <filter id='heavy-drop-shadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='5'/>
          <feOffset dx='4' dy='2' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.8'/>
          </feComponentTransfer>
          <feBlend in='SourceGraphic' />
        </filter>

        <filter id='lighten'>
          <feComponentTransfer>
            <feFuncR type='linear' slope='1.6' />
            <feFuncG type='linear' slope='1.6' />
            <feFuncB type='linear' slope='1.6' />
          </feComponentTransfer>
        </filter>

        <filter id='lighting'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='5' result='blur1'/>
          <feSpecularLighting result='specOut' in='blur1' specularConstant='1.8' specularExponent='48' lightingColor='#ccc'>
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

      <Card viewBox={viewBox} type="reshuffle" label="Re-Shuffle ↻" value="6" />
      {/* <Card viewBox={viewBox} type="number" value="4" /> */}
      {/* <Card viewBox={viewBox} type="reset" label="Free" labelOffset="30" value="⭘" /> */}
      {/* <Card viewBox={viewBox} type="transfer" label="Transfer" value="✖" /> */}
      {/* <Card viewBox={viewBox} type="skip" label="Skip" labelOffset="30" value="2" /> */}
      

    </svg>
  );
}

function Card(props) {
  const {
    viewBox: [viewLeft, viewTop, viewWidth, viewHeight],
    label,
    labelOffset,
    value,
    type
  } = props;
  const [width, height] = [225, 350];
  const left = viewLeft + viewWidth / 2 - width / 2;
  const top = viewTop + viewHeight / 2 - height / 2;
  const strokeWidth = 10;
  const textHeight = 40;
  const iconOverlapText = 10;

  const id = 'card';
  const clipId = `clip-${id}`;
  const labelId = `label-${id}`;
  
  const iconRadius = width / 2 - textHeight - strokeWidth / 2 + iconOverlapText;
  
  return <g 
    class={`card ${type}-card`} 
    filter='url(#heavy-drop-shadow)'
    transform={`translate(${left}, ${top})`}
  >
    <rect 
      className="card-bg"
      id={id}
      x={0}
      y={0}
      width={width}
      height={height}
      fill='#009dde'
      stroke='#fff'
      strokeWidth={strokeWidth}
      rx={20}
    />
    
    <clipPath id={clipId}>
      <use href={`#${id}`} />
    </clipPath>

    {label && <g className='card-labels'>
      <g id={labelId}>
        <rect 
          id={id}
          x={0}
          y={0}
          width={textHeight + strokeWidth / 2}
          height={height / 2}
          fill='#fff'
          clipPath={`url(#${clipId})`}
        />
        <text 
          className="card-label"
          y={textHeight / 2 + strokeWidth / 2}
          x={-strokeWidth - (labelOffset ?? 0)}
          fontSize={textHeight * .7}
          fontWeight={700}
          transform="rotate(-90)"
          textAnchor='end'
          dominantBaseline='central'
        >{label}</text>
      </g>
    </g>}

    <use href={`#${labelId}`} transform={`rotate(180, ${width / 2}, ${height / 2})`} />

    <g class='card-value' fontSize={1.5 * iconRadius}>
      <circle 
        cx={width / 2}
        cy={height / 2}
        r={iconRadius}
        fill="#242021"
      />
      <text
        x={width / 2}
        y={height / 2}
        fontWeight={400}
        textAnchor='middle'
        dominantBaseline='central'
        fill='#fff'
      >{value}</text>
    </g>
  </g>;
}


export default App;
