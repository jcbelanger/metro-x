import './CardMat.css';
import React from 'react';
import Card from './Card';
import SvgDefsContext, { useDefIds } from './SvgDefsContext';

const CardMat = React.forwardRef(({landscape=true, numDrawn=0, onDeckActivated}, ref) => {
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

  function handleDeckKeyPressed(event) {
    if (onDeckActivated && ["Enter", "Space"].indexOf(event.code) >= 0) {
      onDeckActivated(event);
    }
  }

  const majorAxis = landscape ? 0 : 1;
  const minorAxis = 1 - majorAxis;
  const [majorPos, minorPos] = [majorAxis, minorAxis].map(axis => ['x', 'y'][axis]);
  // eslint-disable-next-line no-unused-vars
  const [majorLen, minorLen] = [majorAxis, minorAxis].map(axis => ['width', 'height'][axis]);

  const cardDims = {width: 225, height:350};
  const gap = 50;

  const deckOffset = {x: 2, y: 1}
  const maxNumOffsets = Math.max(0, cards.length - 1);
  const maxDeckOffset = Object.fromEntries(Object.entries(deckOffset).map(([k, v]) => [k, v * maxNumOffsets]));

  const viewPad = 30;
  const shadowPad = 30;
  const viewBox = [-viewPad, -viewPad, cardDims.width + viewPad + shadowPad, cardDims.height + viewPad + shadowPad];
  viewBox[2 + majorAxis] += maxDeckOffset[majorPos] + cardDims[majorLen] + gap;
  viewBox[2 + minorAxis] += maxDeckOffset[minorPos];

  const deckPos = {x:0, y:0};
  const activePos = {...deckPos};
  activePos[majorPos] = activePos[majorPos] + maxDeckOffset[majorPos] + cardDims[majorLen] + gap;

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

      <g ref={ref} onClick={onDeckActivated} tabIndex="0" onKeyDown={handleDeckKeyPressed}>
        {cards.slice(0, cards.length - numDrawn).map((card, ix) => {
          return <Card
            key={ix}
            revealed={false}
            shadow={true}
            x={deckPos.x + deckOffset.x*ix}
            y={deckPos.y + deckOffset.y*ix}
            {...cardDims}
            {...card} 
          />;
        })}
      </g>

      <g>
        {cards.slice(cards.length - numDrawn, cards.length).reverse().map((card, ix) => {
          return <Card
            key={ix}
            revealed={false}
            shadow={true}
            x={activePos.x + deckOffset.x*ix}
            y={activePos.y + deckOffset.y*ix}
            {...cardDims}
            {...card} 
          />;
        })}
      </g>

    </svg>
  </SvgDefsContext.Provider>;
});

export default CardMat;
