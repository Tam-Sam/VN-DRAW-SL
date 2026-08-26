<script lang="ts">
	import { droughtState, type Basemap } from '$lib/state/drought-state.svelte';
	import { INDICATORS } from '$lib/dri';
</script>

<aside class="panel indicator-panel">
	<section>
		<h2><span class="icon">☰</span> Indicators</h2>
		<div class="indicator-list" role="radiogroup" aria-label="Indicator">
			{#each INDICATORS as ind (ind.id)}
				<label class="radio-row">
					<input
						type="radio"
						name="indicator"
						checked={ind.id === droughtState.selectedIndicator}
						onchange={() => (droughtState.selectedIndicator = ind.id)}
					/>
					{ind.label}
				</label>
			{/each}
		</div>
	</section>

	<section>
		<h2><span class="icon">📅</span> Year</h2>
		{#if droughtState.years.length}
			<input
				type="range"
				min={0}
				max={droughtState.years.length - 1}
				step={1}
				value={droughtState.years.indexOf(droughtState.selectedYear)}
				oninput={(e) =>
					(droughtState.selectedYear = droughtState.years[Number(e.currentTarget.value)])}
			/>
			<div class="year-ticks">
				{#each droughtState.years as year (year)}
					<button
						type="button"
						class="year-tick"
						class:active={year === droughtState.selectedYear}
						onclick={() => (droughtState.selectedYear = year)}
					>
						{year}
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<section>
		<h2><span class="icon">🗺</span> Basemap</h2>
		<select
			value={droughtState.basemap}
			onchange={(e) => (droughtState.basemap = e.currentTarget.value as Basemap)}
		>
			<option value="satellite">Satellite</option>
			<option value="street">Street</option>
		</select>
	</section>

	<p class="note">
		DRI is the composite of Hazard, Exposure and Vulnerability, sourced from the pre-processed
		2015–2022 provincial dataset.
	</p>
</aside>

<style>
	.panel {
		/* Matches the page background (not --surface/white) and has no border or
		   shadow — the pane reads as part of the page, not a bordered card. */
		background: var(--surface-2);
		color: var(--ink);
		border-radius: var(--radius);
	}

	.indicator-panel {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		overflow-y: auto;
	}

	h2 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--ink-muted);
		margin: 0 0 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.icon {
		font-size: 0.9em;
	}

	.indicator-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.radio-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.88rem;
		cursor: pointer;
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
	}

	.year-ticks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: 0.5rem;
	}

	.year-tick {
		font-size: 0.75rem;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--ink-muted);
		border-radius: 999px;
		padding: 0.2rem 0.55rem;
		cursor: pointer;
	}

	.year-tick.active {
		background: var(--accent);
		border-color: var(--accent);
		color: white;
		font-weight: 600;
	}

	select {
		width: 100%;
		padding: 0.4rem 0.5rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--ink);
		font-size: 0.85rem;
	}

	.note {
		font-size: 0.75rem;
		color: var(--ink-muted);
		background: var(--surface);
		padding: 0.6rem;
		border-radius: 8px;
		margin: 0;
	}
</style>
