import './Station.scss';
import React from 'react';
import SvgDefsContext from './SvgDefsContext';
import {ariaCheckbox} from './Aria';


const Station = React.forwardRef(({position:[x, y], styles, onClick, disabled=true, checked=false, transfer=false}, ref) => {
  const [cx, cy] = [x, y].map(d => d * styles.spacing);

  return <SvgDefsContext.Consumer>{({url}) => (
    <g
      ref={ref}
      className='station'
      {...ariaCheckbox({
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
    </g>
  )}</SvgDefsContext.Consumer>
});

export default Station;
