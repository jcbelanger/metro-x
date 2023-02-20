import './Station.scss';
import React from 'react';
import {ariaCheckbox} from './Aria';
import {Location} from './AppData'


export type StationRef = SVGGElement;

export type StationProps = {
  position: Location,
  styles: any,
  disabled: boolean,
  checked: boolean,
  transfer: boolean,
  onClick?: (event:React.UIEvent) => void
};

const Station = React.forwardRef<StationRef, StationProps>(({
  position:{x, y}, 
  styles, 
  disabled=true, 
  checked=false, 
  transfer=false,
  onClick
}, ref) => {
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
    <title>{`Station (${x}, ${y})` + (transfer ? ' (transfer)' : '')}</title>

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
      textLength={2 * styles.station.radius}
    >✖</text>}
    
    <circle
      className='station-border'
      cx={cx}
      cy={cy}
      r={styles.station.radius}
      strokeWidth={styles.station.strokeWidth}
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
  </g>;
});

export default Station;
