<script>
import { scaleLinear } from "d3";
import { onMount } from "svelte";

import { SOM } from "$lib/classes/som.js";

export let background = () => {};
export let click = (node) => { console.log(node); };
export let cloudRadius = 60;
export let data;
export let fill = () => { return 'white'; };
export let foreground = () => {};
export let height;
export let name;
export let radius = () => { return 2; };
export let somHeight = 10;
export let somWidth = 10;
export let space = 50;
export let width;

let edges;
let iteration;
let nodes;

const x = scaleLinear()
	.domain([0, (somWidth + 2) * space])
	.range([0, width]);
const y = scaleLinear()
	.domain([0, (somHeight + 2) * space])
	.range([0, height]);

const payload = {
	data,
	height: somHeight,
	space,
	width: somWidth,
};

export function run() {
	worker.postMessage({
		name: "SOM_RUN",
		payload,
	});
}

export function iterate() {
	worker.postMessage({
		name: "SOM_ITERATE",
		payload,
	});
}

onMount(() => {
	worker = new Worker(new URL("./../workers/som.js", import.meta.url), {
		type: "module",
	});
	worker.addEventListener("message", (event) => {
		ready = true;
		iteration = event.data.payload.iteration;
		nodes = event.data.payload.nodes;
		edges = event.data.payload.edges;
	});
});
</script>

{#if ready}
	<g class="som-viz">
		<g class="som-viz-bg-cloud">
			{#each $nodes as node}
				<circle
					cx={x(node.x)}
					cy={y(node.y)}
					fill={background(node)}
					r={cloudRadius}
					/>
			{/each}
		</g>
		<g class="som-viz-fg-cloud">
			{#each $nodes as node}
				<circle
					cx={x(node.x)}
					cy={y(node.y)}
					fill={foreground(node)}
					r={cloudRadius}
				/>
			{/each}
		</g>
		<g class="som-viz-edges">
			{#each $edges as edge}
				<line
					stroke="white"
					stroke-width={0.1}
					x1={x(edge.source.x)}
					x2={x(edge.target.x)}
					y1={y(edge.source.y)}
					y2={y(edge.target.y)}
				/>
			{/each}
		</g>
		<g class="som-viz-nodes">
			{#each $nodes as node}
				<circle
					cx={x(node.x)}
					cy={y(node.y)}
					fill={fill(node)}
					r={radius(node)}
					on:click={() => click(node)}
				/>
			{/each}
		</g>
	</g>
{/if}

<style>
circle {
	cursor: pointer;
}
</style>