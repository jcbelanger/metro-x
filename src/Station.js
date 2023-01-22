import './Station.css';
import React from 'react';
import SvgDefsContext from './SvgDefsContext';
import {ariaButton} from './Aria';


const Station = React.forwardRef(({subways, position:[x, y], styles, onClick, disabled=true}, ref) => {
  const [cx, cy] = [x, y].map(r => r * styles.spacing);
  return <SvgDefsContext.Consumer>{({url}) => (
    <g
      className='station'
      filter={url('faint-drop-shadow')}
      {...ariaButton({
        disabled: disabled, 
        onClick: onClick
      })}
    >
      <title>{`Station (${x}, ${y})`}</title>
      <circle
        ref={ref}
        className='station-circle'
        cx={cx}
        cy={cy}
        r={styles.station.radius}
        strokeWidth={styles.station.strokeWidth}
      />
    </g>
  )}</SvgDefsContext.Consumer>
});

export default Station;
