<script>
import { csvParse, max, scaleLinear } from "d3";
import { Random, Viz } from "$lib/index.js";

// You'll probably not want to put your CSV data files
// in the static/ folder, but c'est la vie.
import rawMembers from "./../../static/members.csv?raw";
import rawVotes from "./../../static/votes.csv?raw";

// Some outliers that weren't normal senators.
const excludes = [
	41904, // Loeffler -- partial.
	41701, // Harris -- vice president.
	99912, // Trump -- president.
	99913, // Biden -- president.
	49300, // Feinstein -- died.
];

// Ideally, you'd do this kind of data work not in the browser.
// I'm doing it here just to demonstrate how it works.
const members = csvParse(rawMembers);
const data = [];
let votes = [];
for (const vote of csvParse(rawVotes)) {
	if (!excludes.includes(+vote.icpsr)) {
		const extant = data.find((d) => d.icpsr === +vote.icpsr);
		if (extant) {
			extant.votes.push({
				cast_code: +vote.cast_code,
				rollnumber: +vote.rollnumber,
			})
		} else {
			const senator = members.find((m) => +m.icpsr === +vote.icpsr);
			data.push({
				bioname: senator.bioname,
				icpsr: +vote.icpsr,
				party: +senator.party_code === 200 ? 'r' : 'd',
				votes: [{
					cast_code: +vote.cast_code,
					rollnumber: +vote.rollnumber,
				}]
			})
		}
		votes.push(+vote.rollnumber);		
	}
}
votes = [...new Set(votes)].sort((a, b) => a - b);
for (const datum of data) {
	// We want a one-hot vector for each vote, merged into a long,
	// sparse vector, which we'll pass to the SOM.
	datum.vector = [];
	for (const rollnumber of votes) {
		const vote = datum.votes.find((v) => v.rollnumber === rollnumber);
		for (let i = 0; i <= 9; i++) {
			datum.vector.push(vote?.cast_code === i ? 1 : 0);
		}
	}
	delete datum.votes;
}

const bgScale = scaleLinear()
	.domain([0, 1])
	.range(["rgba(255,100,100,0.5)", "rgba(100,100,255,0.5)"]);
const callback = (report) => {
	edges = report.edges;
	iteration = report.iteration;
	nodes = report.nodes;
	state = report.state;
};
const forceConfig = {
	centerStrength: 1,
	filterEmpties: false,
	hideEmpties: false,
	iterations: 2,
	manyBodyStrength: -300,
	spaceStrength: 0.03,
}
const somConfig = {
	dimensions: data[0].vector.length,
	height: 9,
	iterations: 50,
	learningRate: 0.25,
	radius: 1.25,
	randomSeed: 42,
	shouldDecay: true,
	width: 9,
};

let active;
let background;
let bgs = [];
let edges = [];
let fill;
let fgs = [];
let height = 468;
let learningRate = 0;
let iteration = 0;
let nodes = [];
let radius = 0;
let ready = false;
let state = null;
let viz;
let width = 468;

$: background = (node) => {
	return `url(#node-bg-${node.id})`;
};
$: bgs = nodes.map((n) => {
	return {
		id: `node-bg-${n.id}`,
		end: "transparent",
		start: bgScale(
			n.data.filter((n) => n.party === "d").length / n.data.length,
		),
	};
});
$: fill = (node) => {
	if (node.data.length > 0) {
		return `url(#node)`;
	} else {
		return 'black'
	}
};
$: radius = (node) => {
	if (node.data.length === 0) {
		return 3.5;
	} else if (active && active.id === node.id) {
		return 14;
	} else {
		return 3.5;
	}
}
</script>

<main>
	<div id="controls">
		<header>
			<h2>Midsommer</h2>
			<h1>How the Senate of the 117th congress voted.</h1>
		</header>
		<div class="control">
			<button on:click={() => { viz.run() }}>run</button>
		</div>
		<div class="control">
			<p>iteration {iteration}</p>
		</div>
		<div class="control">
			<p>learning rate {Math.round(state ? state.learningRate * 100 : 0) / 100}</p>
		</div>
		<div class="control">
			<p>radius {Math.round(state ? state.radius * 100 : 0) / 100}</p>
		</div>
	</div>
	<div id="inspector">
		{#if active}
			<ul>
				{#each active.data as senator}
				<li>
					<span class="name">{senator.bioname}</span> 
					<span class="party">({senator.party.toUpperCase()})</span>
				</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div id="viz">
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
				click={(node) => {active = active && active.id === node.id ? null : node}}
				data={data}
				fill={fill}
				forceConfig={forceConfig}
				height={height}
				radius={radius}
				somConfig={somConfig}
				width={width}
			/>
		</svg>
	</div>
</main>

<style>
#controls {
	border: 1px solid white;
	box-sizing: border-box;
	height: 60px;
	left: 15px;
	position: fixed;
	padding: 15px;
	top: 15px;
	width: calc(500px + 300px + 15px);
}
#controls header {
	float: left;
}
#controls header h2 {
	color: white;
	font-family: "Helvetica";
	font-size: 10px;
	letter-spacing: 3px;
	line-height: 15px;
	text-transform: uppercase;
}
#controls header h1 {
	color: white;
	font-family: "Helvetica";
	font-size: 15px;
	font-weight: 800;
	line-height: 15px;
}
#controls .control {
	float: right;
	margin-left: 15px;
}
#controls .control button {
	background-color: black;
	box-sizing: border-box;
	border: 1px solid white;
	border-radius: 0px;
	color: white;
	cursor: pointer;
	font-family: "Helvetica";
	font-size: 10px;
	font-weight: 400;
	height: 30px;
	line-height: 15px;
	width: 150px;
}
#controls .control p {
	color: white;
	font-family: "Helvetica";
	font-size: 10px;
	height: 30px;
	line-height: 30px;
}
#inspector {
	border: 1px solid white;
	box-sizing: border-box;
	height: 500px;
	left: 15px;
	overflow: scroll;
	padding: 15px;
	position: fixed;
	top: calc(15px + 60px + 15px);
	width: 300px;
}
#inspector ul {
	color: white;
	margin-left: 15px;
}
#viz {
	border: 1px solid white;
	box-sizing: border-box;
	height: 500px;
	left: calc(300px + 15px + 15px);
	padding: 15px;
	position: fixed;
	top: calc(15px + 60px + 15px);
	width: 500px;
}
</style>