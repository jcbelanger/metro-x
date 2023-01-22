import './Station.css';
import React from 'react';
import SvgDefsContext from './SvgDefsContext';
import {ariaCheckbox} from './Aria';


const Station = React.forwardRef(({position:[x, y], styles, onClick, disabled=true, checked=false, transfer=false}, ref) => {
  const [cx, cy] = [x, y].map(d => d * styles.spacing);

  return <SvgDefsContext.Consumer>{({url}) => (
    <g
      className={'station' + (transfer ? ' transfer' : '') }
      filter={url('faint-drop-shadow')}
      {...ariaCheckbox({
        checked: checked,
        disabled: disabled, 
        onClick: onClick
      })}
    >
      <title>{`Station (${x}, ${y})` + (transfer ? ' (transfer)' : '')}</title>
      <circle
        ref={ref}
        className='station-circle'
        cx={cx}
        cy={cy}
        r={styles.station.radius}
        strokeWidth={styles.station.strokeWidth}
      />
      {transfer && <text 
        x={cx}
        y={cy}
        textLength={2 * styles.station.radius}
        textAnchor='middle'
        dominantBaseline='central'
      >✖</text>}
    </g>
  )}</SvgDefsContext.Consumer>
});

export default Station;
