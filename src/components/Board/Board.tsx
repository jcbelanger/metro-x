import './Board.scss';

import React from 'react';
import Immutable from 'immutable';
import {Subway as SubwayElement, SubwayRef } from '../Subway/Subway';
import Station, { StationRef } from '../Station/Station';
import { Location, Subway, SubwayName, Window, Edge } from '../../common/AppData';
import { AppStylesContext } from '../../common/AppStyles';


export type { SubwayRef, StationRef };

export type BoardRef = {
  subways: () => SubwayRef | null,
  stations: () => StationRef | null
};

export type BoardProps = {
  subways: Immutable.Map<SubwayName, Subway>,
  edgeSets: Immutable.Map<Edge, Immutable.Set<SubwayName>>,
  vertexSets: Immutable.Map<Location, Immutable.Set<SubwayName>>,
  windows: Immutable.Map<SubwayName, Immutable.List<Window>>,
  previewWindows: Immutable.Map<SubwayName, Immutable.List<Window>>,
  transfers: Immutable.Set<Location>,
  previewTransfers: Immutable.Set<Location>,
  stations: Immutable.Set<Location>,
  previewStations: Immutable.Set<Location>,
  selectedSubway?: SubwayName,
  selectedStation?: Location,
  subwaySelectDisabled: boolean,
  stationSelectDisabled: boolean,
  onSubwayClick?: (label:SubwayName, ref:React.RefObject<SubwayRef>, event:React.UIEvent) => void,
  onStationClick?: (position:Location, ref:React.RefObject<StationRef>, event:React.UIEvent) => void
};

const Board = React.forwardRef<BoardRef, BoardProps>(({
  subways,
  edgeSets,
  vertexSets,
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
  const styles = React.useContext(AppStylesContext);

  const subwaysRef = React.useRef<SVGGElement>(null);
  const stationsRef = React.useRef<SVGGElement>(null);
  React.useImperativeHandle(ref, () => ({
    subways: () => subwaysRef.current,
    stations: () => stationsRef.current
  }));


  const viewPadding = 30;
  const points = subways
    .valueSeq()
    .flatMap(({route, trainCar:{x, y}}) => route.push(
      new Location({x:x-2, y}), //label
      new Location({x:x-1, y}), //points
      new Location({x, y}) //left window
    ))
    .toList();
  const xs = points.map(({x}) => x);
  const ys = points.map(({y}) => y);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  
  const [right, bottom] = [maxX, maxY].map(r => r * styles.spacing + viewPadding);
  const [left, top] = [minX, minY].map(r => r * styles.spacing - viewPadding);
  const viewBox = [left, top, right - left, bottom - top];

  return <svg 
    className='Board'
    version='1.1'
    baseProfile='full' 
    width='100%'
    height='100%'
    viewBox={viewBox.join(' ')} 
    xmlns='http://www.w3.org/2000/svg'
  >
    <g 
      ref={subwaysRef}
      tabIndex={-1}
      className='subways'
      role='radiogroup'
    >
      <title>Subway Select</title>
      {subways.valueSeq().map(subway => {
        const windowValues = windows.get(subway.name);
        const isWindowsFull = (windowValues?.size ?? 0) >= subway.numWindows;
        const checked = selectedSubway === subway.name ? 'mixed' : false;
        
        const ref = React.createRef<SubwayRef>();
        function handleSubwayClick(event:React.UIEvent) {
          onSubwayClick?.(subway.name, ref, event)
        }

        return <SubwayElement 
          ref={ref}
          key={subway.name}
          subway={subway}
          windows={windowValues}
          previewWindows={previewWindows.get(subway.name)}
          edgeOverlaps={edgeSets}
          checked={checked}
          disabled={subwaySelectDisabled || isWindowsFull}
          onClick={handleSubwayClick}
        />;
      })}
    </g>

    <g
      ref={stationsRef}
      tabIndex={-1}
      className='stations'
      role='radiogroup'
    >
      <title>Station Select</title>
      {vertexSets
        .toKeyedSeq()
        .map((vertexSet, position) => {
          const ref = React.createRef<StationRef>();
          function handleStationClick(event:React.UIEvent) {
            onStationClick?.(position, ref, event);
          }
          
          return <Station 
            key={position.toString()}
            ref={ref}
            position={position}
            finished={subways.filter(subway => position.equals(subway.route.last())).toSet()}
            checked={previewStations.has(position) ? 'mixed' : stations.has(position)}
            transfer={previewTransfers.has(position) || transfers.has(position)}
            transferPoints={vertexSet.size * 2}
            disabled={stationSelectDisabled || stations.has(position)}
            onClick={handleStationClick}
          />;
        })
        .valueSeq()}
    </g>
    
  </svg>;
});

export default Board;
