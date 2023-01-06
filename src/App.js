import './App.css';
import React, { useState } from 'react';
import * as metroCity from './metro-city.json';

function zip(...iterables) {
  const iters = iterables.map(iterable => iterable[Symbol.iterator]());
  return {
    [Symbol.iterator]() {
      return {
        next: () => {
          let results = iters.map(iter => iter.next());
          return {
            value: results.map(result => result.value),
            done: results.some(result => result.done)
          };
        }
      }
    }
  };
}

function hasNested(data, keys) {
  var value = data;
  for (const key of keys) {
    if (!value.has(key)) {
      return false;
    }
    value = value.get(key);
  }
  return true;
}

function getNested(data, keys) {
  var value = data;
  for (const key of keys) {
    if (!value.has(key)) {
      return undefined;
    }
    value = value.get(key);
  }
  return value;
}

function setNested(data, keys, combine, initial) {
  const lastData = keys.slice(0, -1).reduce(
    (prevData, key) => {
      if (prevData.has(key)) {
        return prevData.get(key);
      } else {
        const nextData = new Map();
        prevData.set(key, nextData);
        return nextData;
      }
    }, data);

  const lastKey = keys[keys.length - 1];

  let lastValue;
  if (lastData.has(lastKey)) {
    lastValue = combine(lastData.get(lastKey))
  } else {
    lastValue = initial();
  }

  lastData.set(lastKey, lastValue);
  return lastValue;
}

function comparator(...keys) {
  return (a, b) => {
    for (const key of keys) {
      const compare = key(a) - key(b);
      if (compare !== 0) {
        return compare;
      }
    }
    return 0;
  };
}

function normalizeEdge(edge) {
  return edge.sort(comparator(
    ([x,y]) => x,
    ([x,y]) => y,
  ));
}

function App() {
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
    return xy.map(d =>  d * styles.spacing);
  }

  const stationRefs = new Map();
  for (const subway of subways) {
    for (const xy of subway.stations) {
      setNested(stationRefs, xy, prev => prev, () => React.createRef());
    }
  }

  const edgeLabels = new Map();
  for (const subway of subways) {
    const edges = zip(subway.stations, subway.stations.slice(1));
    for (const edge of edges) {
      const key = normalizeEdge(edge).flat();
      setNested(edgeLabels, key, prev => prev.add(subway.label), () => new Set([subway.label]));
    }
  }
  
  function handleStationClick(x, y) {
    const stationRef = stationRefs.get(x)?.get(y);
    stationRef?.current?.focus();
  }

  const stationWidth = 2 * (styles.station.radius + styles.station.strokeWidth);
  const stations = subways.flatMap(subway => subway.stations);
  const maxX = Math.max(...stations.map(([x, y]) => x));
  const maxY = Math.max(...stations.map(([x, y]) => y));
  const [bottom, right] = toSVG([maxX, maxY]).map(r => r + stationWidth);
  const [top, left] = [0, 0];
  const viewBox = [top, left, bottom, right];
  const stationsTranslate = [stationWidth / 2, stationWidth / 2];

  return (
    <svg version='1.1' baseProfile='full' width='100%' height='100%' viewBox={viewBox} xmlns='http://www.w3.org/2000/svg'>
      <g transform={`translate(${stationsTranslate})`}>
        <g>
          {subways.map(subway => {
            const edges = zip(subway.stations, subway.stations.slice(1));
            const points = Array.from(edges).flatMap(edge => {
              const [[x1, y1], [x2, y2]] = edge.map(toSVG);
              const [rise, run] = [y1 - y2, x1 - x2];
              const [perpRise, perpRun] = [-run, rise];

              const key = normalizeEdge(edge).flat();
              const labels = getNested(edgeLabels, key);
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

            return <g key={subway.label} data-subway={subway.label}>
              <polyline
                points={points}
                strokeWidth={styles.track.strokeWidth} 
                fill="none"
                stroke={subway.color} />
            </g>
          })}
        </g>
        <g>
            {Array.from(stationRefs.entries(), ([x, ys]) => 
              <React.Fragment key={x}>
                {Array.from(ys.entries(), ([y, ref]) => {
                  const [cx, cy] = toSVG([x, y]);
                  return <circle
                    key={y} 
                    ref={ref}
                    cx={cx}
                    cy={cy}
                    r={styles.station.radius}
                    strokeWidth={styles.station.strokeWidth}
                    className='station-circle'
                    tabIndex={-1}
                    onClick={handleStationClick} />;
                })}
              </React.Fragment>
            )}
        </g>
      </g>
    </svg>
  );
}

export default App;
