export default [
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
] as {
	name: string,
	numWindows: number,
	routeCompletionBonus: [number, number],
	color: string,
	trainCar: [number, number],
	route: [number, number][]
}[];
