<script lang="ts">
	let { title, children }: { title: string; children: import('svelte').Snippet } = $props();
</script>

<div class="page-shell">
	<h1>{title}</h1>
	<div class="body">
		{@render children()}
	</div>
</div>

<style>
	.page-shell {
		max-width: 760px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 3rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0 0 1rem;
		color: var(--ink);
	}

	.body {
		background: var(--surface);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		padding: 1.5rem;
		color: var(--ink-secondary);
		line-height: 1.6;
	}
</style>
