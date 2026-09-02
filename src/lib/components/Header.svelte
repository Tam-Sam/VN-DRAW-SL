<script lang="ts">
	import { droughtState } from '$lib/state/drought-state.svelte';

	let query = $state('');
	let showResults = $state(false);
	let openInfo = $state<'help' | 'about' | null>(null);

	const matches = $derived.by(() => {
		const fc = droughtState.currentData;
		if (!fc || !query.trim()) return [];
		const q = query.trim().toLowerCase();
		return fc.features.filter((f) => f.properties.ADM1_EN.toLowerCase().includes(q)).slice(0, 8);
	});

	function pick(name: string) {
		droughtState.focusProvince?.(name);
		query = name;
		showResults = false;
	}
</script>

<header class="app-header">
	<div class="brand">
		<span class="logo">💧</span>
		<div class="brand-text">
			<strong>VN-DRAW</strong>
			<span>Vietnam Drought Risk Assessment and Warning portal</span>
		</div>
	</div>

	<div class="search-wrap">
		<input
			type="search"
			placeholder="Search province..."
			bind:value={query}
			onfocus={() => (showResults = true)}
			onblur={() => setTimeout(() => (showResults = false), 120)}
		/>
		{#if showResults && matches.length}
			<ul class="search-results">
				{#each matches as f (f.properties.ADM1_EN)}
					<li>
						<button type="button" onclick={() => pick(f.properties.ADM1_EN)}>
							{f.properties.ADM1_EN}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="header-actions">
		<button
			type="button"
			class="icon-btn"
			aria-label="Help"
			onclick={() => (openInfo = openInfo === 'help' ? null : 'help')}>?</button
		>
		<button
			type="button"
			class="icon-btn"
			aria-label="About"
			onclick={() => (openInfo = openInfo === 'about' ? null : 'about')}>i</button
		>
	</div>

	{#if openInfo}
		<div class="info-popover" role="dialog">
			{#if openInfo === 'help'}
				<h3>Using the map</h3>
				<p>Select a year and click a province to see its Drought Risk Index (DRI) and trend.</p>
			{:else}
				<h3>About VN-DRAW</h3>
				<p>
					VN-DRAW visualizes provincial drought risk across Vietnam from a composite index of
					hazard, exposure and vulnerability.
				</p>
			{/if}
			<button type="button" class="close" onclick={() => (openInfo = null)}>Close</button>
		</div>
	{/if}
</header>

<style>
	.app-header {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.6rem 1.2rem;
		background: var(--header-bg);
		color: white;
		flex-shrink: 0;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.logo {
		font-size: 1.6rem;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	.brand-text strong {
		font-size: 1.1rem;
		letter-spacing: 0.02em;
	}

	.brand-text span {
		font-size: 0.72rem;
		color: var(--header-ink-muted);
	}

	.search-wrap {
		position: relative;
		flex: 1;
		max-width: 360px;
		margin-left: auto;
	}

	.search-wrap input {
		width: 100%;
		padding: 0.45rem 0.8rem;
		border-radius: 999px;
		border: none;
		font-size: 0.85rem;
	}

	.search-results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--surface);
		color: var(--ink);
		border-radius: 10px;
		box-shadow: var(--shadow);
		list-style: none;
		margin: 0;
		padding: 0.3rem;
		max-height: 260px;
		overflow-y: auto;
		z-index: 20;
	}

	.search-results button {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		color: inherit;
	}

	.search-results button:hover {
		background: var(--surface-2);
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.icon-btn {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.4);
		background: transparent;
		color: white;
		font-weight: 700;
		cursor: pointer;
	}

	.info-popover {
		position: absolute;
		top: calc(100% + 6px);
		right: 1.2rem;
		width: 260px;
		background: var(--surface);
		color: var(--ink);
		border-radius: 10px;
		box-shadow: var(--shadow);
		padding: 0.9rem;
		z-index: 30;
	}

	.info-popover h3 {
		margin: 0 0 0.4rem;
		font-size: 0.9rem;
	}

	.info-popover p {
		margin: 0 0 0.6rem;
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	.info-popover .close {
		font-size: 0.78rem;
		border: none;
		background: var(--surface-2);
		padding: 0.3rem 0.7rem;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
