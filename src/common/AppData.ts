import Immutable from 'immutable';


export enum CardType {
    NUMBER,
    RESHUFFLE,
    FREE,
    TRANSFER,
    SKIP
}
  
export type NumberCard = {
    type: CardType.NUMBER;
    value: number
};
  
export type ReShuffleCard = {
    type: CardType.RESHUFFLE;
    label: 'Re-Shuffle ↻';
    value: 6;
};
  
export type FreeCard = {
    type: CardType.FREE;
    label: 'Free';
    value: '⭘'
};
  
export type TransferCard = {
    type: CardType.TRANSFER;
    label: 'Transfer';
    value: '✖';
};
  
export type SkipCard = {
    type: CardType.SKIP;
    label: 'Skip';
    value: number
}

export type Card = 
    | NumberCard
    | ReShuffleCard
    | FreeCard
    | TransferCard
    | SkipCard;

export const NewDeck:Immutable.List<Card> = Immutable.List([
	{type: CardType.NUMBER, value: 3},
	{type: CardType.NUMBER, value: 3},
	{type: CardType.NUMBER, value: 3},
	{type: CardType.NUMBER, value: 4},
	{type: CardType.NUMBER, value: 4},
	{type: CardType.NUMBER, value: 4},
	{type: CardType.NUMBER, value: 5},
	{type: CardType.NUMBER, value: 5},
	{type: CardType.RESHUFFLE, label:'Re-Shuffle ↻', value: 6},
	{type: CardType.FREE, label: 'Free', value: '⭘'},
	{type: CardType.TRANSFER, label: 'Transfer', value: '✖'},
	{type: CardType.TRANSFER, label: 'Transfer', value: '✖'},
	{type: CardType.SKIP, label: 'Skip', value: 2},
	{type: CardType.SKIP, label: 'Skip', value: 2},
	{type: CardType.SKIP, label: 'Skip', value: 3}
]);

export type Window = 
  | string 
  | number;

export type LocationProps = {
	x: number,
	y: number
}
  
export class Location extends Immutable.Record<LocationProps>({
	x: 0,
	y: 0
}) {
	xy():[number, number] {
		return [this.x, this.y];
	}
}

export type EdgeProps = {
	start:Location,
	stop:Location
};
  
export class Edge extends Immutable.Record<EdgeProps>({
	start: new Location(),
	stop: new Location()
}) {
	points():[[number, number], [number, number]] {
		return [this.start.xy(), this.stop.xy()];
	}

	reverse():Edge {
		return new Edge({start: this.stop, stop: this.start});
	}
}

export type SubwayName = string;

export type SubwayProps = {
    name: SubwayName,
    numWindows: number,
    routeCompletionBonus: [number, number],
    color: string,
    trainCar: Location,
    route: Immutable.List<Location>
};

export class Subway extends Immutable.Record<SubwayProps>({
	name: "??",
	numWindows: 1,
	routeCompletionBonus: [0, 0],
	color: "#fff",
	trainCar: new Location(),
	route: Immutable.List()
}) {}

export function fromJSON(json:({
	name: string,
	numWindows: number,
	routeCompletionBonus: [number, number],
	color: string,
	trainCar: [number, number],
	route: [number, number][]
})[]):Immutable.Map<SubwayName, Subway> {
	return Immutable.Map(json.map(item => [
		item.name,
		new Subway({
			name: item.name,
			numWindows: item.numWindows,
			routeCompletionBonus: item.routeCompletionBonus,
			color: item.color,
			trainCar: new Location({x: item.trainCar[0], y:item.trainCar[1]}),
			route: Immutable.List(item.route.map(([x, y]) => new Location({x, y})))
		})
	]));
}


import metroCityData from '../data/metro-city';
export const MetroCity = fromJSON(metroCityData);

import tubeTownData from '../data/tube-town';
export const TubeTown = fromJSON(tubeTownData);

export const subwayMaps = [
	{
		name: 'Metro City',
		subways: MetroCity
	},
	{
		name: 'Tube Town',
		subways: TubeTown
	}
];
