import './CardMat.css';
import React from 'react';
import Card from './Card';
import SvgDefsContext, { useDefIds } from './SvgDefsContext';


function CardDeck({orientation}) {
  const [left, top, width, height] = [0, 0, 400, 400]
  const viewBox = [left, top, width, height];

  // const cards = [
  //   {type: "reshuffle", label:"Re-Shuffle ↻", value: 6}
  // ];

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
      {/* <Card viewBox={viewBox} type="reshuffle" label="Re-Shuffle ↻" value="6" /> */}
      {/* <Card viewBox={viewBox} type="number" value="4" /> */}
      {/* <Card viewBox={viewBox} type="free" label="Free" labelOffset="30" value="⭘" /> */}
      {/* <Card viewBox={viewBox} type="transfer" label="Transfer" value="✖" /> */}
      <Card viewBox={viewBox} type="skip" label="Skip" labelOffset="30" value="2" />
    </svg>
  </SvgDefsContext.Provider>;
}

export default CardDeck;
