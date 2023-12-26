<script>
import { scaleLinear } from "d3";
import { onMount } from "svelte";
import workerUrl from "$lib/workers/worker.js?worker&url";

import { SOM } from "$lib/classes/som.js";
export let background = () => {
	return "transparent";
};
export let callback;
export let click = (node) => {
	console.log(node);
};
export let cloudRadius = 60;
export let data;
export let fill = () => {
	return "black";
};
export let foreground = () => {
	return "transparent";
};
export let height;
export let line = "white";
export let name = "";
export let radius = () => {
	return 2;
};
export let somConfig = {};
export let space = 50;
export let xOffset = 0;
export let yOffset = 0;
export let width;

let edges;
let iteration;
let nodes;
let ready = false;
let worker;

const x = scaleLinear()
	.domain([0, (somConfig.width + 2) * space])
	.range([xOffset, width + xOffset]);
const y = scaleLinear()
	.domain([0, (somConfig.height + 2) * space])
	.range([yOffset, height + yOffset]);

const payload = {
	data,
	somConfig,
	space,
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
	worker = new Worker(workerUrl, { type: "module" });
	worker.addEventListener("message", (event) => {
		ready = true;
		edges = event.data.payload.edges;
		iteration = event.data.payload.iteration;
		nodes = event.data.payload.nodes;
		callback({
			edges: edges,
			iteration: iteration,
			nodes: nodes,
		});
	});
});
</script>

{#if ready}
	<g class="som-viz">
		<g class="som-viz-bg-cloud">
			{#each nodes as node}
				<circle
					cx={x(node.x)}
					cy={y(node.y)}
					fill={background(node)}
					r={cloudRadius}
					/>
			{/each}
		</g>
		<g class="som-viz-fg-cloud">
			{#each nodes as node}
				<circle
					cx={x(node.x)}
					cy={y(node.y)}
					fill={foreground(node)}
					r={cloudRadius}
				/>
			{/each}
		</g>
		<g class="som-viz-edges">
			{#each edges as edge}
				<line
					stroke={line}
					stroke-width={0.1}
					x1={x(edge.source.x)}
					x2={x(edge.target.x)}
					y1={y(edge.source.y)}
					y2={y(edge.target.y)}
				/>
			{/each}
		</g>
		<g class="som-viz-nodes">
			{#each nodes as node}
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