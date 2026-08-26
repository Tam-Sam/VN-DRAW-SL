<script lang="ts">
	import FrameworkDiagram from '$lib/components/FrameworkDiagram.svelte';
</script>

<div class="home">
	<h1>VN-DRAW</h1>
	<p class="lede">
		A framework for assessing, visualising and acting on agricultural drought risk across Vietnam.
	</p>
	<FrameworkDiagram />
</div>

<style>
	.home {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 3rem;
	}

	h1 {
		font-size: 1.7rem;
		margin: 0 0 0.5rem;
		color: var(--ink);
	}

	.lede {
		color: var(--ink-secondary);
		margin: 0 0 1.5rem;
		max-width: 840px;
		line-height: 1.5;
	}
</style>
