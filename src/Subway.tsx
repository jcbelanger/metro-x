import './Subway.scss';
import React from 'react';
import Immutable from 'immutable';
import classNames from 'classnames';
import * as AppData from './AppData';
import { AppStylesContext } from './AppStyles';
import { ariaCheckbox } from './Aria';


export type SubwayRef = SVGGElement;

export type SubwayProps = {
  subway: AppData.Subway,
  edgeOverlaps: Immutable.Map<AppData.Edge, Immutable.Set<AppData.SubwayName>>,
  windows?: Immutable.List<AppData.Window>,
  previewWindows?: Immutable.List<AppData.Window>,
  checked?: boolean | 'mixed',
  disabled?: boolean,
  onClick?: (event:React.UIEvent) => void
};

export const Subway = React.forwardRef<SubwayRef, SubwayProps>(({
  subway, 
  edgeOverlaps,
  windows=Immutable.List(),
  previewWindows=Immutable.List(),
  checked=false,
  disabled=true,
  onClick
}, ref) => {
  const styles = React.useContext(AppStylesContext);
  
  const {
    spacing,
    station: {
      radius: stationRadius,
      strokeWidth: stationStrokeWidth
    },
    routeName: {
      radius: routeNameRadius
    },
    completionBonus: {
      initial: {
        width: initBonusWidth,
        height: initBonusHeight,
        strokeWidth: initBonusStrokeWidth,
        dx: initBonusDx,
        dy: initBonusDy
      },
      subsequent: {
        width: subseqBonusWidth,
        height: subseqBonusHeight,
        strokeWidth: subseqBonusStrokeWidth,
        dx: subseqBonusDx,
        dy: subseqBonusDy
      }
    },
    trainCar: {
      paddingX: trainCarPadX,
      paddingY: trainCarPadY, 
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
      },
      underTrack: {
        enabled: underTrackEnabled,
        margin: underTrackMargin,
        strokeWidth: underTrackWidth,
        dashes: underTrackDashes
      }
    }
  } = styles;

  const [trainCarX, trainCarY] = subway.trainCar.xy().map(d => d * spacing);

  const numWindowGaps = Math.max(0, subway.numWindows - 1);

  const trainCarWidth = subway.numWindows * windowWidth + numWindowGaps * windowGap + 2 * trainCarPadX + frontCornerX;
  const trainCarHeight = windowHeight + 2 * trainCarPadY;

  const trainCarLeft = trainCarX - windowWidth / 2 - trainCarPadX;
  const trainCarTop = trainCarY - trainCarHeight / 2;

  const trainCarCX = trainCarLeft + trainCarWidth / 2;
  const trainCarCY = trainCarTop + trainCarHeight / 2;
  const trainCarPos = [trainCarCX, trainCarCY].map(d => d / spacing);
  const trainCar = new AppData.Location({x: trainCarPos[0], y:trainCarPos[1]});

  const path = subway.route.unshift(trainCar);
  const pathStarts = path.toSeq();
  const pathStops = pathStarts.skip(1);
  const pathEdgePairs = pathStarts.zip(pathStops) as Immutable.Seq.Indexed<[AppData.Location, AppData.Location]>;
  const pathEdges = pathEdgePairs.map(([start, stop]) => new AppData.Edge({start, stop}));

  const routePoints = pathEdges.flatMap((edge, edgeIx) => {
    const [[x1, y1], [x2, y2]] = edge.points().map(pos => pos.map(d => d * spacing));
    const [rise, run] = [y1 - y2, x1 - x2];
    const [perpRise, perpRun] = [-run, rise];

    const forwardOverlaps = edgeOverlaps.get(edge, Immutable.Set<AppData.SubwayName>([subway.name]));
    const backwardOverlaps = edgeOverlaps.get(edge.reverse(), Immutable.Set<AppData.SubwayName>());
    const overlaps = forwardOverlaps.union(backwardOverlaps);
    const namesIndex = overlaps.sort().valueSeq().keyOf(subway.name) ?? 0;

    const stationDiameter = Math.max(0, 2 * stationRadius + stationStrokeWidth);
    const edgeWidth = styles.route.strokeWidth + styles.route.edgeGap;
    const maxPerpOffset = (overlaps.size / 2) * edgeWidth - edgeWidth / 2;
    const perpOffset = maxPerpOffset - namesIndex * edgeWidth;

    const sign = rise <= 0 && run <= 0 ? -1 : 1;
    const edgeDist = Math.sqrt(rise * rise + run * run);
    const [xPerpOffset, yPerpOffset] = [perpRun, perpRise].map(r => sign * (r / edgeDist) * perpOffset);

    const maxTangOffset = edgeIx === 0 ? 0 : Math.max(0, stationDiameter / 2 - styles.route.strokeWidth / 2);
    const soh = perpOffset / maxTangOffset;
    const sohClamp = Math.max(-1, Math.min(1, soh)); //numbers like -1.000000002 give NaN in asin()
    const tangOffset = maxPerpOffset === 0 ? maxTangOffset : Math.cos(Math.asin(sohClamp)) * maxTangOffset;
    const [xTangOffset, yTangOffset] = [run, rise].map(r => (r / edgeDist) * tangOffset);

    return [
      //[x1, y1],
      new AppData.Location({x:x1 + xPerpOffset - xTangOffset, y:y1 + yPerpOffset - yTangOffset}),
      new AppData.Location({x:x2 + xPerpOffset + xTangOffset, y:y2 + yPerpOffset + yTangOffset})
      //[x2, y2]
    ];
  });

  const [cx, cy] = subway.trainCar.xy().map(d => d * spacing);
  const left = cx - windowWidth / 2 - trainCarPadX;
  const top = cy - trainCarHeight / 2;

  const bodyId = `train-cart-body-${subway.name}`;
  const bodyClipId = `train-cart-body-clip-${subway.name}`;

  const frontLightMargin = frontWidth / 2 - frontLightRadius;
  const frontLightCx = left + trainCarWidth - frontLightRadius - frontLightMargin;
  const frontLightCy = top + trainCarHeight - frontLightRadius - frontLightMargin;

  const frontWindowLeft = left + trainCarWidth - frontWidth;
  const frontWindowHeight = trainCarHeight - 2 * (frontLightMargin + frontLightRadius);

  const numWheels = Math.max(2, subway.numWindows);

  const underTrackLeft = left + wheelsMargin + wheelRadius;
  const underTrackY = top + trainCarHeight + underTrackMargin + underTrackWidth / 2;
  const underTrackLength= trainCarWidth - 2 * wheelsMargin - 2 * wheelRadius;

  const [initBonus, subseqBonus] = subway.routeCompletionBonus;
  const [initBonusX, initBonusY] = [trainCarX - spacing + initBonusDx, trainCarY + initBonusDy];
  const [subseqBonusX, subseqBonusY] = [trainCarX - spacing + subseqBonusDx, trainCarY + subseqBonusDy];

  const [routeNameX, routeNameY] = [trainCarX - 2 * spacing, trainCarY];

  const windowValues = [...windows, ...previewWindows];

  
  return <g 
    ref={ref}
    className='subway'
    style={{'--color': subway.color} as any}
    {...ariaCheckbox<SVGGElement>({
      checked: checked,
      disabled: disabled, 
      onClick: onClick
    })}
  >
    <title>{`Subway ${subway.name}`}</title>

    {underTrackEnabled && <path
      className='under-track' 
      d={`M${underTrackLeft},${underTrackY} h${underTrackLength}`}
      stroke='#9aa2a5'
      strokeWidth={underTrackWidth}
      strokeDasharray={underTrackDashes}
    />}

    <g className='subway-route'>
      <title>Subway Route: {subway.name}</title>
      <polyline
        className='route'
        points={routePoints.flatMap(loc => loc.xy()).join(' ')}
        strokeWidth={styles.route.strokeWidth}
        strokeLinejoin='round'
        strokeLinecap='round'
        fill='none'
        stroke={subway.color}
      />
    </g>

    <g className='subway-status'>

      <g className='route-name'>
        <title>Subway {subway.name}</title>
        <circle
          className='route-name-bg'
          cx={routeNameX}
          cy={routeNameY}
          r={routeNameRadius}
          fill={subway.color}
        />
        <text 
          x={routeNameX}
          y={routeNameY}
          textAnchor='middle'
          dominantBaseline='central'
        >{subway.name}</text>

        <circle 
          className='route-name-border'
          cx={routeNameX}
          cy={routeNameY}
          r={routeNameRadius}
          fill={subway.color}
        />
      </g>

      <g className='bonuses'>
        <g className='subsequent-bonus'>
          <title>Subsequent Completion Bonus: {subway.name}</title>
          <rect 
            x={subseqBonusX - subseqBonusWidth / 2}
            y={subseqBonusY - subseqBonusHeight / 2}
            width={subseqBonusWidth}
            height={subseqBonusHeight}
            fill='#FFF'
            stroke='#BDBEC0'
            strokeWidth={subseqBonusStrokeWidth}
          />
          <text 
              x={subseqBonusX}
              y={subseqBonusY}
              fill='#231F20'
              textAnchor='middle'
              dominantBaseline='central'
            >{subseqBonus}</text>
        </g>
        <g className='initial-bonus'>
          <title>Initial Completion Bonus: {subway.name}</title>
          <path 
            d={`
              M${initBonusX},${initBonusY - initBonusHeight / 2}
              l${initBonusWidth / 2},${initBonusHeight / 2}
              l${-initBonusWidth / 2},${initBonusHeight / 2}
              l${-initBonusWidth / 2},${-initBonusHeight / 2}
              z
            `}
            fill='#FFD501'
            stroke='#E88D3C'
            strokeWidth={initBonusStrokeWidth}
          />
          <text 
            x={initBonusX}
            y={initBonusY}
            fill='#231F20'
            textAnchor='middle'
            dominantBaseline='central'
          >{initBonus}</text>
        </g>
      </g>

      <g className='train-cart'>

        <g className='wheels'>
          {Immutable.Range(0, numWheels).map(wheelIndex => {
            const wheelsWidth = trainCarWidth - 2 * wheelsMargin - 2 * wheelRadius;
            const wheelStep = wheelsWidth / (numWheels - 1);
            const wheelCx = left + wheelsMargin + wheelRadius + wheelIndex * wheelStep;
            const wheelCy = top + trainCarHeight;
            return <circle
              key={wheelIndex}
              className='wheel'
              cx={wheelCx}
              cy={wheelCy}
              r={wheelRadius}
              fill='#22211e'
            />;
          })}
        </g>

        <path 
          className='train-cart-body'
          id={bodyId}
          fill={subway.color}
          d={`
            M${left},${top}
            m${0},${trainCarPadY}
            a${trainCarPadX},${trainCarPadY} 0 0,1 ${trainCarPadX},${-trainCarPadY}
            h${trainCarWidth - 2 * trainCarPadX - frontCornerX}
            a${trainCarPadX + frontCornerX},${trainCarPadY + frontCornerY} 0 0,1 ${trainCarPadX + frontCornerX},${trainCarPadY + frontCornerY}
            v${trainCarHeight - frontCornerY - trainCarPadY}
            h${-trainCarWidth}
            z
          `}
        />

        <clipPath id={bodyClipId}>
          <use href={`#${bodyId}`} />
        </clipPath>

        <g className='front'>
          <circle 
            className='front-light'
            cx={frontLightCx}
            cy={frontLightCy}
            r={frontLightRadius}
            fill='#22211e'
          />

          <rect 
            className='front-window'
            x={frontWindowLeft}
            y={top}
            width={frontWidth}
            height={frontWindowHeight}
            fill='#22211e'
            clipPath={`url(#${bodyClipId})`}
          />
        </g>

        <g className='windows'>
          {Immutable.Range(0, subway.numWindows).map(windowIndex => {
            const windowLeft = left + trainCarPadX + windowIndex * (windowWidth + windowGap);
            const windowTop = top + trainCarPadY;
            const windowValue = windowIndex < windowValues.length ? windowValues[windowIndex] : undefined;
            return <g 
              key={windowIndex}
              className={classNames('window', {
                preview: windows.size <= windowIndex && windowIndex < windows.size + previewWindows.size
              })}
            >
              <rect
                className='window-fill'
                x={windowLeft}
                y={windowTop}
                width={windowWidth}
                height={windowHeight}
                fill='#ffffff'
              />
              <path 
                className='window-border'
                strokeWidth={windowBorder}
                d={`M${windowLeft},${windowTop} h${windowWidth} v${windowHeight} h${-windowWidth} z`} 
              />

              {windowValue !== undefined && <text
                x={windowLeft + windowWidth / 2}
                y={windowTop + windowHeight / 2}
                textAnchor='middle'
                dominantBaseline='central'
              >{windowValue}</text>}
            </g>;
          })}
        </g>
      </g>
    </g>
  </g>;
});

export default Subway;