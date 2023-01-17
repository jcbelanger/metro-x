
import React from 'react';

const Station = React.forwardRef(({subways, position, styles, onClick}, ref) => {
  const [cx, cy] = position.map(r => r * styles.spacing);
  return <circle
    ref={ref}
    cx={cx}
    cy={cy}
    r={styles.station.radius}
    strokeWidth={styles.station.strokeWidth}
    className='station-circle'
    tabIndex={-1}
    onClick={() => onClick(position)} 
  />;
});

export default Station;
