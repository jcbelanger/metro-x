import { useId } from 'react';
import './Card.css';
import SvgDefsContext from './SvgDefsContext';


function Card(props) {
    const {
      x,
      y,
      width,
      height,
      label,
      value,
      type,
      revealed,
      shadow
    } = props;

    const strokeWidth = 10;
    const textHeight = 40;
    const iconOverlapText = 10;
  
    const id = useId();
    const clipId = id + '-clip';
    
    const iconRadius = width / 2 - textHeight - strokeWidth / 2 + iconOverlapText;
    const labelOffset = label?.length ?? 0 <= 5 ? 30 : 0;
    
    return <SvgDefsContext.Consumer>{ ({url}) => (
      <g 
        className={`card ${type}-card`}
        transform={`translate(${x}, ${y})`}
        filter={shadow ? url('heavy-drop-shadow') : undefined}
      >
        <rect 
          className="card-bg"
          id={id}
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width - strokeWidth}
          height={height - strokeWidth}
          fill='#009dde'
          stroke='#fff'
          strokeWidth={strokeWidth}
          rx={20}
        />
        
        <clipPath id={clipId}>
          <use href={`#${id}`} />
        </clipPath>
    
        {label 
          ? <g className='card-labels'>
            {[0, 180].map(rotation => (
                <g 
                  key={rotation}
                  className='card-label' 
                  transform={`rotate(${rotation}, ${width / 2}, ${height / 2})`}
                >
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
                      x={-strokeWidth - labelOffset}
                      fontSize={textHeight * .7}
                      fontWeight={700}
                      transform="rotate(-90)"
                      textAnchor='end'
                      dominantBaseline='central'
                  >{label}</text>
              </g>
            ))}
          </g>
          : undefined
        }
        
        <g className='card-value' fontSize={1.5 * iconRadius}>
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
      </g>
    )}</SvgDefsContext.Consumer>;
    
    
  }
  
  
  export default Card;
  