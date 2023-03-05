import './Station.scss';

import React from 'react';
import { ariaCheckbox } from './Aria';
import { Location, Subway } from './AppData'
import { AppStylesContext } from './AppStyles';
import Immutable from 'immutable';



export type StationRef = SVGGElement;

export type StationProps = {
  position: Location,
  disabled: boolean,
  checked: boolean | 'mixed',
  transfer: boolean,
  finished: Immutable.Set<Subway>,
  transferPoints?: number,
  onClick?: (event:React.UIEvent) => void
};

const Station = React.forwardRef<StationRef, StationProps>(({
  position:{x, y},
  disabled=true,
  checked=false, 
  transfer=false,
  finished,
  transferPoints,
  onClick
}, ref) => {
  const styles = React.useContext(AppStylesContext);

  const [cx, cy] = [x, y].map(d => d * styles.spacing);

  return <g
    ref={ref}
    className='station'
    {...ariaCheckbox<SVGGElement>({
      checked: checked,
      disabled: disabled, 
      onClick: onClick
    })}
  >
    <title>{
      `Station (${x}, ${y})` + 
      (finished.isEmpty() ? '' : ` (Route ${finished.map(x => x.name).join(', ')} end)`) + 
      (transfer ? ' (Transfer)' : '')
    }</title>

    <circle
      className='station-bg'
      cx={cx}
      cy={cy}
      r={styles.station.radius}
    />

    {transfer && <text 
      className="station-value"
      x={cx}
      y={cy}
    >{transferPoints ?? '✖'}</text>}
    
    <rect
      className='station-pointer-coarse-bg'
      x={cx - styles.spacing / 2}
      y={cy - styles.spacing / 2}
      width={styles.spacing}
      height={styles.spacing}
    />

    <circle
      className='station-border-bg'
      cx={cx}
      cy={cy}
      r={styles.station.radius}
      strokeWidth={styles.station.strokeWidth}
    />

    <circle
      className='station-border'
      cx={cx}
      cy={cy}
      r={styles.station.radius}
      strokeWidth={styles.station.strokeWidth}
    />


    {finished.valueSeq().map((subway, ix) => {
      const circumference = 2 * Math.PI * styles.station.radius;
      const arcLen = (1 / finished.size) * circumference;
      return <circle
        className='station-border-finished'
        key={subway.name}
        cx={cx}
        cy={cy}
        r={styles.station.radius}
        strokeWidth={styles.station.strokeWidth}
        stroke={subway.color}
        strokeDashoffset={ix * arcLen + circumference / 4}
        strokeDasharray={`${arcLen} ${circumference - arcLen}`}
      />;
    })}

  </g>;
});

export default Station;
