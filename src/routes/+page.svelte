<script>
import { max, scaleLinear } from "d3";
import { Random, Viz } from "$lib/index.js";

const rando = new Random(42);

const data = [];
for (let i = 0; i < 1000; i++) {
	data.push({
		vector: rando.vector(3).map((d) => d * 255),
	});
}

const height = 500;
const iterations = 200;
const width = 500;

const forceConfig = {
	centerStrength: 1,
	filterEmpties: true,
	hideEmpties: false,
	iterations: 10,
	manyBodyStrength: -30,
	spaceStrength: 0,
}

const somConfig = {
	dimensions: data[0].vector.length,
	height: 20,
	iterations,
	learningRate: 0.4,
	radius: 1,
	randomSeed: 42,
	shouldDecay: true,
	width: 20,
};

let viz;

let bgs = [];
let edges = [];
let fgs = [];
let iteration = 0;
let nodes = [];
let state = null;

const callback = (report) => {
	edges = report.edges;
	iteration = report.iteration;
	nodes = report.nodes;
	state = report.state;

	const bgScale = scaleLinear()
		.domain([0, max(nodes.map((n) => n.data.length))])
		.range(["transparent", "rgba(255,0,0,0.75)"]);
	const fgScale = scaleLinear()
		.domain([0, max(nodes.map((n) => n.data.length))])
		.range(["transparent", "rgba(0,0,255,0.5)"]);
	bgs = nodes.map((n) => {
		return {
			id: `node-bg-${n.id}`,
			end: "transparent",
			start: `rgba(${n.neuron[0]},${n.neuron[1]},${n.neuron[2]},0.5)`,
		};
	});
	fgs = nodes.map((n) => {
		return {
			id: `node-fg-${n.id}`,
			end: "transparent",
			start: "transparent"
		};
	});
};

const background = (node) => {
	return `url(#node-bg-${node.id})`;
};
const fill = (node) => {
	return `url(#node)`;
};
const foreground = (node) => {
	return `url(#node-fg-${node.id})`;
};
</script>

<div>
	<div><p>iteration {iteration}</p></div>
	<button on:click={() => { viz.run() }}>Run</button>
	<button on:click={() => { viz.iterate() }}>iterate</button>
	<svg height={height} width={width}>
		<g class="defs">
			<defs>
				<radialGradient id="node">
					<stop offset="0%" stop-color="white" />
					<stop offset="50%" stop-color="white" />
					<stop offset="100%" stop-color="transparent" />
				</radialGradient>
				{#each bgs as bg}
					<radialGradient id="{bg.id}">
						<stop offset="0%" stop-color="{bg.start}" />
						<stop offset="100%" stop-color="{bg.end}" />
					</radialGradient>
				{/each}
				{#each fgs as fg}
					<radialGradient id="{fg.id}">
						<stop offset="0%" stop-color="{fg.start}" />
						<stop offset="100%" stop-color="{fg.end}" />
					</radialGradient>
				{/each}
			</defs>
		</g>
		<Viz
			bind:this={viz}
			background={background}
			callback={callback}
			data={data}
			fill={fill}
			forceConfig={forceConfig}
			foreground={foreground}
			height={height}
			somConfig={somConfig}
			width={width}
		/>
	</svg>
</div>

<style>
	svg {
		background-color: black;
	}
</style>