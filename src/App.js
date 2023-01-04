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
      radius: 10,
      strokeWidth: 4
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
      const forward = setNested(edgeLabels, key, prev => prev.add(subway.label), () => new Set([subway.label]));
    }
  }
  
  function handleStationClick(x, y) {
    const stationRef = stationRefs.get(x)?.get(y);
    stationRef?.current?.focus();
  }

  return (
    <svg version='1.1' baseProfile='full' width='100%' height='100%' viewBox='0 0 900 600' xmlns='http://www.w3.org/2000/svg'>
        <g>
          {subways.map(subway => {
            const edges = zip(subway.stations, subway.stations.slice(1));
            const points = Array.from(edges).flatMap(edge => {
              const [[x1, y1], [x2, y2]] = edge.map(toSVG);
              const [rise, run] = [y1 - y2, x1 - x2];
              const [perpRise, perpRun] = rise === 0 || run === 0 ? [run, rise] : [-run, rise];

              const dist = Math.sqrt(rise * rise + run * run);

              const key = normalizeEdge(edge).flat();
              const labels = getNested(edgeLabels, key);
              const edgeIndex = Array.from(labels).sort().indexOf(subway.label);
              const stationWidth = 2 * styles.station.radius + styles.station.strokeWidth - styles.track.strokeWidth;
              const edgeWidth = stationWidth / labels.size;

              const [xOffset, yOffset] = [perpRun, perpRise].map(r => {
                const ratio = r / dist;
                const indexOffset = stationWidth / 2 - edgeWidth / 2 - edgeIndex * edgeWidth;
                return ratio * indexOffset;
              });

              return [
                [x1, y1],
                [x1 + xOffset, y1 + yOffset],
                [x2 + xOffset, y2 + yOffset],
                [x2, y2]
              ];
            })

            return <g key={subway.label}>
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
    </svg>
  );
}

export default App;
