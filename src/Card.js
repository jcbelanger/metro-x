import './Card.css';


function Card(props) {
    const {
      viewBox: [viewLeft, viewTop, viewWidth, viewHeight],
      label,
      labelOffset,
      value,
      type
    } = props;
    const [width, height] = [225, 350];
    const left = viewLeft + viewWidth / 2 - width / 2;
    const top = viewTop + viewHeight / 2 - height / 2;
    const strokeWidth = 10;
    const textHeight = 40;
    const iconOverlapText = 10;
  
    const id = 'card';
    const clipId = `clip-${id}`;
    
    const iconRadius = width / 2 - textHeight - strokeWidth / 2 + iconOverlapText;
    
    return <g 
      className={`card ${type}-card`} 
      filter='url(#heavy-drop-shadow)'
      transform={`translate(${left}, ${top})`}
    >
      <rect 
        className="card-bg"
        id={id}
        x={0}
        y={0}
        width={width}
        height={height}
        fill='#009dde'
        stroke='#fff'
        strokeWidth={strokeWidth}
        rx={20}
      />
      
      <clipPath id={clipId}>
        <use href={`#${id}`} />
      </clipPath>
  
      {label && <g className='card-labels'>
        {[0, 180].map(rotation => (
            <g 
                className='card-label' transform={`rotate(${rotation}, ${width / 2}, ${height / 2})`}>
                <rect 
                    x={0}
                    y={0}
                    width={textHeight + strokeWidth / 2}
                    height={height / 2}
                    fill='#fff'
                    clipPath={`url(#${clipId})`}
                />
                <text 
                    className="card-label"
                    y={textHeight / 2 + strokeWidth / 2}
                    x={-strokeWidth - (labelOffset ?? 0)}
                    fontSize={textHeight * .7}
                    fontWeight={700}
                    transform="rotate(-90)"
                    textAnchor='end'
                    dominantBaseline='central'
                >{label}</text>
            </g>
        ))}
      </g>}
  
  
      <g class='card-value' fontSize={1.5 * iconRadius}>
        <circle 
          cx={width / 2}
          cy={height / 2}
          r={iconRadius}
          fill="#242021"
        />
        <text
          x={width / 2}
          y={height / 2}
          fontWeight={400}
          textAnchor='middle'
          dominantBaseline='central'
          fill='#fff'
        >{value}</text>
      </g>
    </g>;
  }
  
  
  export default Card;
  