import './CardMat.css';
import React from 'react';
import Card from './Card';
import SvgDefsContext, { useDefIds } from './SvgDefsContext';

function CardDeck({landscape}) {
  const [left, top, width, height] = [0, 0, 400, 400]
  const viewBox = [left, top, width, height];

  const cards = [
    {type: 'number', value: 3},
    {type: 'number', value: 3},
    {type: 'number', value: 3},
    {type: 'number', value: 4},
    {type: 'number', value: 4},
    {type: 'number', value: 4},
    {type: 'number', value: 5},
    {type: 'number', value: 5},
    {type: "reshuffle", label:"Re-Shuffle ↻", value: 6},
    {type: "free", label: "Free", labelOffset: "30", value: "⭘"},
    {type: "transfer", label: "Transfer", value: "✖"},
    {type: "transfer", label: "Transfer", value: "✖"},
    {type: "skip", label: "Skip", labelOffset: "30", value: 2},
    {type: "skip", label: "Skip", labelOffset: "30", value: 2},
    {type: "skip", label: "Skip", labelOffset: "30", value: 3}
  ];

  const svgDefs = useDefIds(['heavy-drop-shadow']);
  const {id} = svgDefs;
  return <SvgDefsContext.Provider value={svgDefs}>
    <svg 
        className='CardMat'
        version='1.1'
        baseProfile='full' 
        width='100%'
        height='100%'
        viewBox={viewBox} 
        xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        <filter id={id('heavy-drop-shadow')} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='5'/>
          <feOffset dx='4' dy='2' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.8'/>
          </feComponentTransfer>
          <feBlend in='SourceGraphic' />
        </filter>
      </defs>

      {cards.map((card, ix) => (
        <Card
          key={[card.type, card.value]} 
          viewBox={ landscape 
            ? [left + (cards.length / 2 - ix) * 50 - 225/2, top, width, height]
            : [left, top + (cards.length / 2 - ix) * 20 - 350/2, width, height]
          } 
          {...card} 
        />
      ))}
    </svg>
  </SvgDefsContext.Provider>;
}

export default CardDeck;
