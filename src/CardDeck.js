import './CardDeck.css';
import React from 'react';
import Card from './Card';


function CardDeck() {
  const [left, top, width, height] = [0, 0, 400, 400]
  const viewBox = [left, top, width, height];

  return (
    <svg 
        className='Board'
        version='1.1'
        baseProfile='full' 
        width='100%'
        height='100%'
        viewBox={viewBox} 
        xmlns='http://www.w3.org/2000/svg'
    >

      <Card viewBox={viewBox} type="reshuffle" label="Re-Shuffle ↻" value="6" />
      {/* <Card viewBox={viewBox} type="number" value="4" /> */}
      {/* <Card viewBox={viewBox} type="free" label="Free" labelOffset="30" value="⭘" /> */}
      {/* <Card viewBox={viewBox} type="transfer" label="Transfer" value="✖" /> */}
      {/* <Card viewBox={viewBox} type="skip" label="Skip" labelOffset="30" value="2" /> */}

    </svg>
  );
}

export default CardDeck;
