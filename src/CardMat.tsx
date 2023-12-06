import './CardMat.scss';

import React from 'react';
import { List } from 'immutable';
import Card from './Card';
import {ariaButton} from './Aria';
import * as AppData from './AppData';


export type DeckRef = SVGGElement;

export type CardMapProps = {
  landscape:boolean
  cards: List<AppData.Card>
  numDrawn: number,
  cardDrawDisabled: boolean
  onDeckDraw?: (event:React.UIEvent) => void
};

const CardMat = React.forwardRef<DeckRef, CardMapProps>(({cards=List(), landscape=true, numDrawn=0, cardDrawDisabled=false, onDeckDraw}, ref) => {
  const majorAxis = landscape ? 0 : 1;
  const minorAxis = 1 - majorAxis;
  const [majorPos, minorPos] = [majorAxis, minorAxis].map(axis => ['x', 'y'][axis]) as ('x' | 'y')[];
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [majorLen, _minorLen] = [majorAxis, minorAxis].map(axis => ['width', 'height'][axis]) as ('width' | 'height')[];

  const cardDims = {width: 225, height:350};
  const gap = 50;

  const deckOffset = {x: 2, y: 1}
  const maxNumOffsets = Math.max(0, cards.size - 1);
  const maxDeckOffset = Object.fromEntries(Object.entries(deckOffset).map(([k, v]) => [k, v * maxNumOffsets]));

  const viewPad = 30;
  const shadowPad = 30;
  const viewBox = [-viewPad, -viewPad, cardDims.width + viewPad + shadowPad, cardDims.height + viewPad + shadowPad];
  viewBox[2 + majorAxis] += maxDeckOffset[majorPos] + cardDims[majorLen] + gap;
  viewBox[2 + minorAxis] += maxDeckOffset[minorPos];

  const deckPos = {x:0, y:0};
  const activePos = {...deckPos};
  activePos[majorPos] = activePos[majorPos] + maxDeckOffset[majorPos] + cardDims[majorLen] + gap;

  return <svg 
      className='CardMat'
      version='1.1'
      baseProfile='full' 
      width='100%'
      height='100%'
      viewBox={viewBox.join(' ')} 
      xmlns='http://www.w3.org/2000/svg'
  >
    <g
      className='deck'
      ref={ref}
      {...ariaButton<SVGGElement>({
        disabled: cardDrawDisabled, 
        onClick: (event:React.UIEvent<SVGGElement>) => onDeckDraw?.(event)
      })}
    >
      <title>Draw next card</title>

      <g className='deck-bottom'>
        <circle 
          cx={deckPos.x + cardDims.width / 2}
          cy={deckPos.y + cardDims.height / 2}
          r={Math.min(cardDims.width, cardDims.height) / 2}
          fill={cardDrawDisabled ? '#677275' : '#43a047'}
        />
        <text  
          x={deckPos.x + cardDims.width / 2}
          y={deckPos.y + cardDims.height / 2}
          fontWeight={700}
          textAnchor='middle'
          dominantBaseline='central'
          fill='#fff'
          fontSize={Math.min(cardDims.width, cardDims.height) / 2}
        >{cardDrawDisabled ? '✖' : '✓'}</text>

      </g>
      
      {cards.slice(0, cards.size - numDrawn).map((card, ix) =>
        <Card
          key={ix}
          revealed={false}
          x={deckPos.x + deckOffset.x * ix}
          y={deckPos.y + deckOffset.y * ix}
          card={card}
          {...cardDims}
        />
      )}
    </g>

    <g>
      {cards.slice(cards.size - numDrawn, cards.size).reverse().map((card, ix) => 
        <Card
          key={ix}
          revealed={true}
          x={activePos.x + deckOffset.x * ix}
          y={activePos.y + deckOffset.y * ix}
          card={card}
          {...cardDims}
        />
      )}
    </g>

  </svg>;
});

export default CardMat;
