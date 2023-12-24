import { color, extent, forceLink, forceSimulation, scaleLinear } from "d3";

import { SOM } from "$lib/classes/som.js";
import { cosine } from "$lib/util.js";

const cosineScale = scaleLinear()
	.domain([-1, 1])
	.range([0.1, 1]);
const nodes = [];
const edges = [];

let data;
let height;
let iterations;
let simulation;
let space;
let som;
let spaceHeight;
let spaceWidth;
let width;

let forceSpaceStrength = 0.2;
let i = 0;

const iterate = () => {
	const go = som.iterate(data.map((datum) => datum.vector), i);
	if (!go) {
		return false;
	}

	for (const datum of data) {
		datum.winner = som.winner(datum.vector);
	}

	for (let x = 0; x < som.map.length; x++) {
		for (let y = 0; y < som.map[x].length; y++) {
			const neuron = som.map[x][y];
			let node = nodes.find((n) => n.som_x === x && n.som_y === y);
			if (!node) {
				node = {
					data: data.filter((d) => d.winner.x === x && d.winner.y === y),
					id: `${x}_${y}`,
					neuron,
					som_x: x,
					som_y: y,
				};
				nodes.push(node);
			} else {
				node.data = data.filter(
					(d) => d.winner.x === x && d.winner.y === y,
				);
			}
		}
	}

	for (const edge of edges) {
		const similarity = cosine(
			nodes.find((n) => n.id === edge.source || n.id === edge.source?.id)
				.neuron,
			nodes.find((n) => n.id === edge.target || n.id === edge.target?.id)
				.neuron,
		);
		edge.weight = cosineScale(similarity);
	}

	const ext = extent(edges.map((d) => d.weight));

	const reweight = scaleLinear()
		.domain(ext)
		.range([0, 2]);

	const inverseReweight = scaleLinear()
		.domain(ext)
		.range([space * 2, 0]);

	simulation = forceSimulation(nodes)
		.force(
			"link",
			forceLink(edges)
				.id((d) => d.id)
				.distance((d) => inverseReweight(d.weight))
				.strength((d) => reweight(d.weight))
				.iterations(10),
		)
		.force("space", () => {
			for (const node of nodes) {
				node.vx += ((node.som_x + 1) * space - node.x) * forceSpaceStrength;
				node.vy += ((node.som_y + 1) * space - node.y) * forceSpaceStrength;
			}
		})
		.stop();

	for (let j = 0; j < 200; j++) {
		simulation.tick();
		for (const node of nodes) {
			if (node.x < 0) {
				node.x = 0;
			}
			if (node.x > spaceWidth) {
				node.x = spaceWidth;
			}
			if (node.y < 0) {
				node.y = 0;
			}
			if (node.y > spaceHeight) {
				node.y = spaceHeight;
			}
		}
	}
	self.postMessage({
		type: "SOM_OUT",
		payload: {
			iteration: i + 1,
			nodes,
			edges,
			height: spaceHeight,
			width: spaceWidth,
		},
	});
};

self.addEventListener("message", (event) => {
	const { name, payload } = event.data;
	if (name === "SOM_RUN" || name === "SOM_ITERATE") {
		if (!som) {
			data = payload.data;
			forceSpaceStrength = payload.forceSpaceStrength || 0.2;
			iterations = payload.iterations || 200;
			height = payload.height;
			width = payload.width;
			space = payload.space;

			spaceHeight = (height + 2) * space;
			spaceWidth = (width + 2) * space;

			som = new SOM({
				dimensions: data[0].vector.length,
				height,
				iterations,
				width,
			});

			for (let x = 0; x < som.map.length; x++) {
				for (let y = 0; y < som.map[x].length; y++) {
					const pairs = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
					for (const pair of pairs) {
						if (
							pair[0] >= 0 &&
							pair[0] < width &&
							pair[1] >= 0 &&
							pair[1] < height
						) {
							edges.push({
								source: `${x}_${y}`,
								target: `${pair[0]}_${pair[1]}`,
							});
						}
					}
				}
			}
		}

		if (event.data.name === "SOM_RUN") {
			for (i = 0; i < iterations; i++) {
				const go = iterate();
				if (!go) {
					break;
				}
			}
		} else if (event.data.name === "SOM_ITERATE") {
			iterate();
			i++;
		}
	}
});
