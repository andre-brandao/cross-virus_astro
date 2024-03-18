<script lang="ts">
	import Chart, { type ChartConfiguration } from 'chart.js/auto';

	export let config: ChartConfiguration;
	export let id: string = '';

	export let chart: Chart ;
	let canvas: HTMLCanvasElement;

	export let width = 400;
	export let height = 400;

	function mountMap(node:HTMLCanvasElement){
		const ctx = node.getContext('2d');
		if (!ctx) return;
		chart = new Chart(ctx, config);
	
	}
</script>

<div class="bg-white">
	<canvas {id} bind:this={canvas} use:mountMap {width} {height}></canvas>
</div>