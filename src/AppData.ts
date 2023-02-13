export enum CardType {
    NUMBER='number',
    RESHUFFLE='reshuffle',
    FREE='free',
    TRANSFER='transfer',
    SKIP='skip'
};
  
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

export const NewDeck:Card[] = [
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
];

export type Subway = {
    name: string,
    numWindows: number,
    routeCompletionBonus: [number, number],
    color: string,
    trainCar: [number, number],
    route: [number, number][]
};

export const MetroCity:Subway[] = [
	{
		name: "A",
		numWindows: 2,
		routeCompletionBonus: [2, 1],
		color: "#d11e29",
		trainCar: [-2.5, 0],
		route: [
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 1],
			[3, 1],
			[4, 1],
			[4, 2],
			[4, 4],
			[4, 5],
			[4, 6],
			[3, 7]
		]
	},
	{
		name: "B",
		numWindows: 2,
		routeCompletionBonus: [4, 2],
		color: "#f2801e",
		trainCar: [-2.5, 1.5],
		route: [
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 1],
			[3, 1],
			[4, 1],
			[5, 2],
			[6, 3],
			[6, 4],
			[6, 6],
			[8, 7],
			[10, 7],
			[12, 7],
			[13, 7]
		]
	},
	{
		name: "C",
		numWindows: 3,
		routeCompletionBonus: [7, 5],
		color: "#e8549b",
		trainCar: [-2.5, 3],
		route: [
            [2, 3],
            [3, 3],
            [5, 3],
            [6, 3],
            [7, 5],
            [9, 6],
            [10, 6],
            [11, 6],
            [12, 6],
            [13, 6],
            [13, 5],
            [13, 4],
            [13, 3],
            [13, 2]
		]
	},
	{
		name: "D",
		numWindows: 3,
		routeCompletionBonus: [5, 3],
		color: "#83c143",
		trainCar: [-2.5, 4],
		route: [
            [1, 4],
            [1, 5],
            [2, 5],
            [3, 5],
            [4, 5],
            [5, 5],
            [6, 6],
            [6, 7],
            [7, 8],
            [9, 8],
            [9, 6],
            [9, 5],
            [7, 2],
            [6, 1],
            [5, 1],
            [4, 1]
		]
	},
	{
		name: "E",
		numWindows: 3,
		routeCompletionBonus: [4, 2],
		color: "#fbb418",
		trainCar: [-2.5, 5],
		route: [
            [2, 6],
            [4, 6],
            [4, 7],
            [5, 7],
            [6, 7],
            [7, 8],
            [8, 7],
            [9, 6],
            [9, 5],
            [9, 2],
            [9, 1],
            [9, 0],
            [10, 0],
            [12, 0]
            
		]
	},
	{
		name: "F",
		numWindows: 2,
		routeCompletionBonus: [4, 2],
		color: "#8051a2",
		trainCar: [-2.5, 6],
		route: [
            [3, 7],
            [4, 7],
            [5, 6],
            [6, 6],
            [7, 5],
            [8, 5],
            [9, 6],
            [10, 5],
            [12, 5],
            [12, 4],
            [12, 2]
		]
	},
	{
		name: "G",
		numWindows: 2,
		routeCompletionBonus: [5, 3],
		color: "#008bd4",
		trainCar: [-2.5, 7],
		route: [
		    [3, 7],
            [4, 7],
            [5, 6],
            [6, 6],
            [6, 7],
            [7, 9],
            [9, 8],
            [10, 6],
            [10, 5],
            [10, 3],
            [10, 2],
            [11, 2],
            [11, 1]
		]
	},
	{
		name: "H",
		numWindows: 3,
		routeCompletionBonus: [6, 4],
		color: "#586264",
		trainCar: [-2.5, 8],
		route: [
		    [2, 8],
		    [3, 8],
		    [4, 8],
		    [7, 8],
		    [8, 7],
		    [9, 8],
		    [10, 8],
		    [11, 8],
		    [11, 6],
		    [11, 4],
		    [10, 3],
		    [10, 2],
		    [10, 1],
		    [10, 0]
		]
	},
	{
		name: "I",
		numWindows: 3,
		routeCompletionBonus: [4, 2],
		color: "#008574",
		trainCar: [-2.5, 9],
		route: [
		    [3, 9],
		    [4, 9],
		    [5, 9],
		    [6, 7],
		    [6, 6],
		    [5, 5],
		    [6, 4],
		    [6, 3],
		    [6, 1],
		    [6, 0],
		    [4, 0],
		    [3, 0]
		]
	}
];


export const TubeTown:Subway[] = [
	{
		name: "M",
		numWindows: 2,
		routeCompletionBonus: [5, 3],
		color: "#008bd4",
		// trainCar: [-2, 6],
		trainCar: [-2, 6],
		route: [
			[0, 7],
			[1, 6],
			[2, 5],
			[3, 5],
			[4, 5],
			[5, 5],
			[6, 5],
			[7, 5],
			[8, 5],
			[9, 5],
			[10, 5],
			[11, 5],
			[12, 5],
		]
	},
	{
		name: "N",
		numWindows: 2,
		routeCompletionBonus: [2, 1],
		color: "#586264",
		trainCar: [-2, 7],
		route: [
			[0, 7],
			[0, 8],
			[1, 9],
			[2, 10],
			[3, 10],
			[4, 10]
		]
	},
	{
		name: "L",
		numWindows: 3,
		routeCompletionBonus: [4, 2],
		color: "#8051a2",
		trainCar: [1.6, 3],
		route: [
			[3, 4],
			[3, 5],
			[3, 6],
			[4, 7],
			[5, 7],
			[6, 7],
			[8, 7],
			[9, 7],
			[10, 7],
			[11, 7],
			[12, 7]
		]
	},
	{
		name: "O",
		numWindows: 3,
		routeCompletionBonus: [4, 2],
		color: "#008574",
		trainCar: [2.8, 8],
		route: [
			[3, 7],
			[3, 6],
			[4, 6],
			[5, 6],
			[6, 6],
			[7, 6],
			[8, 6],
			[9, 6],
			[9, 5],
			[9, 4],
			[10, 3],
			[11, 3],
			[12, 3],
		]
	},
	{
		name: "K",
		numWindows: 2,
		routeCompletionBonus: [3, 2],
		color: "#fbb418",
		trainCar: [3, 2],
		route: [
			[4, 3],
			[4, 4],
			[5, 5],
			[5, 6],
			[5, 7],
			[5, 8],
			[5, 9],
			[4, 9],
			[4, 10],
		]
	},
	{
		name: "J",
		numWindows: 3,
		routeCompletionBonus: [6, 4],
		color: "#e8549b",
		trainCar: [2.3, 1],
		route: [
			[5, 1],
			[5, 2],
			[5, 3],
			[5, 4],
			[5, 5],
			[5, 6],
			[5, 7],
			[5, 8],
			[6, 9],
			[8, 9],
			[8, 10],
			[9, 10],
			[10, 10],
			[11, 10],
		]
	},
	{
		name: "Q",
		numWindows: 2,
		routeCompletionBonus: [4, 2],
		color: "#83c143",
		trainCar: [7.8, 1],
		route: [
			[7, 2],
			[7, 3],
			[7, 4],
			[6, 4],
			[6, 5],
			[6, 6],
			[6, 7],
			[6, 8],
			[6, 9],
			[6, 10],
		]
	},
	{
		name: "P",
		numWindows: 2,
		routeCompletionBonus: [4, 2],
		color: "#d11e29",
		trainCar: [7.8, 0],
		route: [
			[10, 0],
			[11, 0],
			[11, 1],
			[11, 2],
			[10, 2],
			[10, 3],
			[10, 4],
			[10, 5],
			[10, 7],
		]
	},
	{
		name: "R",
		numWindows: 4,
		routeCompletionBonus: [7, 5],
		color: "#f2801e",
		trainCar: [9.8, -1.5],
		route: [
			[12, 1],
			[11, 1],
			[10, 1],
			[9, 2],
			[8, 2],
			[7, 2],
			[6, 3],
			[7, 4],
			[8, 4],
			[8, 5],
			[8, 6],
			[8, 7],
			[8, 8],
			[8, 9],
			[9, 9],
			[10, 9],
			[11, 9],
			[12, 9],
			[12, 10],
		]
	}
];

export const subwayMaps = [
	{
		name: 'Metro City',
		subways: MetroCity
	},
	{
		name: 'Tube Town',
		subways: TubeTown
	}
]