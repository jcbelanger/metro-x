import './Card.scss';
import React, { useId } from 'react';
import classNames from 'classnames';
import * as AppData from './AppData';

export type CardProps = {
  x: number,
  y: number,
  width: number,
  height: number,
  card: AppData.Card,
  revealed: boolean
};

export const Card:React.FC<CardProps> = ({
  x,
  y,
  width,
  height,
  card,
  revealed
}) => {

  const strokeWidth = 10;
  const id = useId();
  const bgId = id + '-bg';
  const clipId = id + '-clip';
  

  const front = () => {
    const textHeight = 40;
    const iconOverlapText = 10;
    const iconRadius = width / 2 - textHeight - strokeWidth / 2 + iconOverlapText;
    const labelOffset = 'label' in card && card.label.length <= 5 ? 30 : 0


    return <g className='front'>
      {'label' in card && <g className='card-labels'>
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
              clipPath={`url(#${clipId})`}
            />
            <text 
              className='short-text'
              y={textHeight / 2 + strokeWidth / 2}
              x={-strokeWidth - labelOffset}
              fontSize={textHeight * .7}
              transform='rotate(-90)'
            >{card.label}</text>
          </g>
        ))}
      </g>}
      
      <g className='card-value'>
        <circle 
          cx={width / 2}
          cy={height / 2}
          r={iconRadius}
        />
        <text
          x={width / 2}
          y={height / 2}
          fontSize={1.5 * iconRadius}
        >{card.value}</text>
      </g>
    </g>;
  };

  const back = () => {
    const backStrokeWidth = 40;

    return <g className='back'>
      <g className='back-lines'>
        <line
          x1={strokeWidth / 2 + backStrokeWidth / 2}
          y1={0}
          x2={strokeWidth / 2 + backStrokeWidth / 2}
          y2={height} 
          strokeWidth={backStrokeWidth}
          stroke='#d11e29'
          clipPath={`url(#${clipId})`}
        />
        <line
          x1={0.5 * width}
          y1={height}
          x2={width}
          y2={0.5 * height} 
          strokeWidth={backStrokeWidth}
          stroke='#f2801e'
          strokeLinecap='round'
          clipPath={`url(#${clipId})`}
        />
        <line
          x1={0}
          y1={.75 * height}
          x2={width}
          y2={.75 * height} 
          strokeWidth={backStrokeWidth}
          stroke='#83c143'
          strokeLinecap='round'
          clipPath={`url(#${clipId})`}
        />
        <line
          x1={0}
          y1={.75 * height}
          x2={.50 * width}
          y2={.25 * height} 
          strokeWidth={backStrokeWidth}
          stroke='#8051a2'
          strokeLinecap='round'
          clipPath={`url(#${clipId})`}
        />
        <line
          x1={0.5 * width}
          y1={0}
          x2={1 * width}
          y2={.25 * height} 
          strokeWidth={backStrokeWidth}
          stroke='#fbb418'
          strokeLinecap='round'
          clipPath={`url(#${clipId})`}
        />
        
        <use className='back-stroke-clip' href={`#${bgId}`} fillOpacity={0} />
      </g>
      

      <g className="back-logo">
        <line
          x1={0}
          y1={.25 * height}
          x2={width}
          y2={.25 * height} 
          strokeWidth={backStrokeWidth * 1.5}
        />
        <circle 
          cx={.80 * width}
          cy={.25 * height}
          r={backStrokeWidth / 2 + 2 * strokeWidth}
        />
        <text 
          x={.80 * width}
          y={.25 * height}
          dx={14}
          fontSize={backStrokeWidth}
        >METRO <tspan className='x' fontWeight={700}>X</tspan></text>
      </g>
    </g>;
  };
  
  return <g 
    className={classNames('card', {[card.type + '-card']: revealed})}
    transform={`translate(${x}, ${y})`}
  >
    <rect 
      className='card-bg'
      id={bgId}
      x={strokeWidth / 2}
      y={strokeWidth / 2}
      width={width - strokeWidth}
      height={height - strokeWidth}
      strokeWidth={strokeWidth}
      rx={20}
    />
    
    <clipPath id={clipId}>
      <use href={`#${bgId}`} />
    </clipPath>

    {(revealed ? front : back)()}
    
  </g>;
};
  
export default Card;