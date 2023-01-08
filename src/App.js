import './App.css';
import { zip, comparator } from './utils';
import NestedMap from './nested';
import React, { useState } from 'react';
// import ReactCSSTransitionGroup from 'react-transition-group';
import metroCity from './metro-city.json';


function App() {
  // eslint-disable-next-line no-unused-vars
  const [subways, setSubways] = useState(Array.from(metroCity));

  const styles = {
    spacing: 50,
    station: {
      radius: 15,
      strokeWidth: 5
    },
    track: {
      strokeWidth: 5
    }
  };

  function toSVG(xy) {
    return xy.map(d => d * styles.spacing + styles.station.radius + styles.station.strokeWidth);
  }

  function normalizeEdge(edge) {
    return edge.sort(comparator(
      ([x, y]) => x,
      ([x, y]) => y,
    ));
  }

  const stationRefs = new NestedMap();
  for (const subway of subways) {
    for (const xy of subway.stations) {
      stationRefs.set(xy, prev => prev, () => React.createRef());
    }
  }

  const edgeLabels = new NestedMap();
  for (const subway of subways) {
    const edges = zip(subway.stations, subway.stations.slice(1));
    for (const edge of edges) {
      const key = normalizeEdge(edge).flat();
      edgeLabels.set(key, prev => prev.add(subway.label), () => new Set([subway.label]));
    }
  }

  function handleStationClick(xy) {
    const stationRef = stationRefs.get(xy);
    stationRef?.current?.focus();
  }

  const stationWidth = 2 * (styles.station.radius + styles.station.strokeWidth);
  const stations = subways.flatMap(subway => subway.stations);
  const maxX = Math.max(...stations.map(([x, y]) => x));
  const maxY = Math.max(...stations.map(([x, y]) => y));
  const [bottom, right] = toSVG([maxX, maxY]).map(r => r + stationWidth);
  const [top, left] = [0, 0];
  const viewBox = [top, left, bottom, right];

  return (
    <svg version='1.1' baseProfile='full' width='100%' height='100%' viewBox={viewBox} xmlns='http://www.w3.org/2000/svg'>
      <g>
        {subways.map(subway => {
          const edges = zip(subway.stations, subway.stations.slice(1));
          const points = Array.from(edges).flatMap(edge => {
            const [[x1, y1], [x2, y2]] = edge.map(toSVG);
            const [rise, run] = [y1 - y2, x1 - x2];
            const [perpRise, perpRun] = [-run, rise];

            const key = normalizeEdge(edge).flat();
            const labels = edgeLabels.get(key);
            const edgeIndex = Array.from(labels).sort().indexOf(subway.label);

            const totalEdgesWidth = 2 * styles.station.radius - styles.track.strokeWidth;
            const edgeWidth = totalEdgesWidth / labels.size;
            const maxPerpOffset = totalEdgesWidth / 2 - edgeWidth / 2;
            const perpOffset = maxPerpOffset - edgeIndex * edgeWidth;

            const sign = rise <= 0 && run <= 0 ? -1 : 1;
            const edgeDist = Math.sqrt(rise * rise + run * run);
            const [xPerpOffset, yPerpOffset] = [perpRun, perpRise].map(r => sign * (r / edgeDist) * perpOffset);

            const maxTangOffset = totalEdgesWidth / 2;
            const sohClamp = Math.max(-1, Math.min(1, perpOffset / maxTangOffset)); //numbers like -1.000000002 give NaN in asin()
            const tangOffset = maxPerpOffset === 0 ? maxTangOffset : Math.cos(Math.asin(sohClamp)) * maxTangOffset;
            const [xTangOffset, yTangOffset] = [run, rise].map(r => (r / edgeDist) * tangOffset);

            return [
              // [x1, y1],
              [x1 + xPerpOffset - xTangOffset, y1 + yPerpOffset - yTangOffset],
              [x2 + xPerpOffset + xTangOffset, y2 + yPerpOffset + yTangOffset],
              // [x2, y2]
            ];
          });

          return <g 
            key={subway.label} 
            data-subway={subway.label}>
            <polyline
              points={points}
              strokeWidth={styles.track.strokeWidth}
              fill="none"
              stroke={subway.color} />
          </g>
        })}
      </g>
      <g>
        {Array.from(stationRefs, ([[x, y], ref]) => {
          const [cx, cy] = toSVG([x, y]);
          const stroke = subways.find(subway => {
            const [endX, endY] = subway.stations[subway.stations.length - 1];
            return x === endX && y === endY;
          })?.color ?? '#7e786c';

          return <circle
            key={[x, y]}
            ref={ref}
            cx={cx}
            cy={cy}
            r={styles.station.radius}
            strokeWidth={styles.station.strokeWidth}
            stroke={stroke}
            className='station-circle'
            tabIndex={-1}
            onClick={() => handleStationClick([x, y])} />;
        })}
      </g>
    </svg>
  );
}

export default App;
