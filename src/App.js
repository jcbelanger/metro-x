import './App.css';
import { rangeMap, zip, comparator } from './utils';
import NestedMap from './nested';
import React, { useState } from 'react';
import metroCity from './metro-city.json';

function App() {
  // eslint-disable-next-line no-unused-vars
  const [subways, setSubways] = useState(Array.from(metroCity));
  // eslint-disable-next-line no-unused-vars
  const [styles, setStyles] = useState({
    spacing: 50,
    station: {
      radius: 18,
      strokeWidth: 4
    },
    route: {
      strokeWidth: 9
    },
    trainCar: {
      verticalPadding: 6,
      horizontalPadding: 9,
      front: {
        cornerX: 8,
        cornerY: 15,
        width: 8,
        lightRadius: 3
      },
      window: {
        gap: 8,
        width: 27,
        height: 27,
        border: 2
      },
      wheels: {
        margin: 9,
        radius: 8
      }
    }
  });

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
    for (const xy of subway.route) {
      stationRefs.set(xy, prev => prev, () => React.createRef());
    }
  }

  const edgeNames = new NestedMap();
  for (const subway of subways) {
    const edges = zip(subway.route, subway.route.slice(1));
    for (const edge of edges) {
      const key = normalizeEdge(edge).flat();
      edgeNames.set(key, prev => prev.add(subway.name), () => new Set([subway.name]));
    }
  }

  function handleStationClick(xy) {
    const stationRef = stationRefs.get(xy);
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
  const [right, bottom] = toSVG([maxX, maxY]).map(r => r + stationWidth);
  const [left, top] = toSVG([minX, minY]).map(r => r - stationWidth);
  const viewBox = [left, top, right - left, bottom - top];

  return (
    <svg version='1.1' baseProfile='full' width='100%' height='100%' viewBox={viewBox} xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <filter id="trainCarWindowBorder">
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.8" />
            <feFuncG type="linear" slope="1.8" />
            <feFuncB type="linear" slope="1.8" />
          </feComponentTransfer>
        </filter>
      </defs>
      <g className='train-carts'>
        {subways.map(subway => {
          const {
            verticalPadding, 
            horizontalPadding,
            front: {
              cornerX: frontCornerX,
              cornerY: frontCornerY,
              width: frontWidth,
              lightRadius: frontLightRadius
            },
            window: {
              height: windowHeight,
              width: windowWidth,
              gap: windowGap,
              border: windowBorder
            },
            wheels: {
              margin: wheelsMargin,
              radius: wheelRadius
            }
          } = styles.trainCar;

          const [cx, cy] = toSVG(subway.trainCar);
          const numWindowGaps = Math.max(0, subway.windows - 1);
          const trainCarWidth = subway.windows * windowWidth + numWindowGaps * windowGap + 2 * horizontalPadding + frontCornerX;
          const trainCarHeight = windowHeight + 2 * verticalPadding;
          const left = cx - windowWidth / 2 - horizontalPadding;
          const top = cy - trainCarHeight / 2;

          const bodyId = `train-cart-body-${subway.name}`;
          const bodyClipId = `train-cart-body-clip-${subway.name}`;

          const frontLightMargin = frontWidth / 2 - frontLightRadius;
          const frontLightCx = left + trainCarWidth - frontLightRadius - frontLightMargin;
          const frontLightCy = top + trainCarHeight - frontLightRadius - frontLightMargin;

          const frontWindowLeft = left + trainCarWidth - frontWidth;
          const frontWindowHeight = trainCarHeight - 2 * (frontLightMargin + frontLightRadius);

          const numWheels = Math.max(2, subway.windows);

          return <g key={subway.name} classname="train-cart">

            <g className="wheels">
              {[...rangeMap(numWheels, wheelIndex => {
                const wheelsWidth = trainCarWidth - 2 * wheelsMargin - 2 * wheelRadius;
                const wheelStep = wheelsWidth / (numWheels - 1);
                const wheelCx = left + wheelsMargin + wheelRadius + wheelIndex * wheelStep;
                const wheelCy = top + trainCarHeight;
                return <circle
                  cx={wheelCx}
                  cy={wheelCy}
                  r={wheelRadius}
                  fill="#22211e"
                />;
              })]}
            </g>

            <path 
                class="train-cart-body"
                id={bodyId}
                fill={subway.color} 
                d={`
                  M${left},${top}
                  m${0},${verticalPadding}
                  a${horizontalPadding},${verticalPadding} 0 0,1 ${horizontalPadding},${-verticalPadding}
                  h${trainCarWidth - 2 * horizontalPadding - frontCornerX}
                  a${horizontalPadding + frontCornerX},${verticalPadding + frontCornerY} 0 0,1 ${horizontalPadding + frontCornerX},${verticalPadding + frontCornerY}
                  v${trainCarHeight - frontCornerY - verticalPadding}
                  h${-trainCarWidth}
                  z
                `}
              />

              <clipPath id={bodyClipId}>
                <use href={`#${bodyId}`} />
              </clipPath>

              <g classname="front">
                <circle 
                  classname="front-light"
                  cx={frontLightCx}
                  cy={frontLightCy}
                  r={frontLightRadius}
                  fill="#22211e"
                />

                <rect 
                  classname="front-window"
                  x={frontWindowLeft}
                  y={top}
                  width={frontWidth}
                  height={frontWindowHeight}
                  fill="#22211e"
                  clip-path={`url(#${bodyClipId})`}
                />
              </g>

              <g className="windows">
                {[...rangeMap(subway.windows, windowIndex => {
                  const windowLeft = left + horizontalPadding + windowIndex * (windowWidth + windowGap);
                  const windowTop = top + verticalPadding;
                  return <g classname="window" key={windowIndex}>
                    <rect
                      x={windowLeft}
                      y={windowTop}
                      width={windowWidth}
                      height={windowHeight}
                      fill="#ffffff"
                    />
                    <path 
                      strokeWidth={windowBorder}
                      strokeLinejoin="round"
                      fill="none"
                      stroke={subway.color}
                      d={`M${windowLeft},${windowTop} h${windowWidth} v${windowHeight} h${-windowWidth} z`} 
                      filter="url(#trainCarWindowBorder)"
                    />
                  </g>;
                })]}
              </g>
          </g>;
        })}
      </g>
      <g>
        {subways.map(subway => {
          const edges = zip(subway.route, subway.route.slice(1));
          const points = Array.from(edges).flatMap(edge => {
            const [[x1, y1], [x2, y2]] = edge.map(toSVG);
            const [rise, run] = [y1 - y2, x1 - x2];
            const [perpRise, perpRun] = [-run, rise];

            const key = normalizeEdge(edge).flat();
            const names = edgeNames.get(key);
            const edgeIndex = Array.from(names).sort().indexOf(subway.name);

            const stationDiameter = Math.max(0, 2 * styles.station.radius + styles.station.strokeWidth);
            const edgeWidth = stationDiameter / names.size;
            const maxPerpOffset = stationDiameter / 2 - edgeWidth / 2;
            const perpOffset = maxPerpOffset - edgeIndex * edgeWidth;

            const sign = rise <= 0 && run <= 0 ? -1 : 1;
            const edgeDist = Math.sqrt(rise * rise + run * run);
            const [xPerpOffset, yPerpOffset] = [perpRun, perpRise].map(r => sign * (r / edgeDist) * perpOffset);

            const maxTangOffset = Math.max(0, stationDiameter / 2 - styles.route.strokeWidth / 2);
            const soh = perpOffset / maxTangOffset;
            const sohClamp = Math.max(-1, Math.min(1, soh)); //numbers like -1.000000002 give NaN in asin()
            const tangOffset = maxPerpOffset === 0 ? maxTangOffset : Math.cos(Math.asin(sohClamp)) * maxTangOffset;
            const [xTangOffset, yTangOffset] = [run, rise].map(r => (r / edgeDist) * tangOffset);

            return [
              //[x1, y1],
              [x1 + xPerpOffset - xTangOffset, y1 + yPerpOffset - yTangOffset],
              [x2 + xPerpOffset + xTangOffset, y2 + yPerpOffset + yTangOffset],
              //[x2, y2]
            ];
          });

          return <g 
            key={subway.name} 
            data-subway={subway.name}>
            <polyline
              points={points}
              strokeWidth={styles.route.strokeWidth}
              strokeLinejoin="round"
              fill="none"
              stroke={subway.color}
            />
          </g>
        })}
      </g>
      <g>
        {Array.from(stationRefs, ([[x, y], ref]) => {
          const [cx, cy] = toSVG([x, y]);

          return <circle
            key={[x, y]}
            ref={ref}
            cx={cx}
            cy={cy}
            r={styles.station.radius}
            strokeWidth={styles.station.strokeWidth}
            className='station-circle'
            tabIndex={-1}
            onClick={() => handleStationClick([x, y])} 
          />;
        })}
      </g>
    </svg>
  );
}


export default App;
