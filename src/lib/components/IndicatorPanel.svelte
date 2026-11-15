<script lang="ts">
	import { droughtState, type Basemap } from '$lib/state/drought-state.svelte';
	import { 
		INDICATORS,
		indicatorValue,
		riskInfoFor,
		driRiskClasses,
		continuousStops,
		type IndicatorId
	 } from '$lib/dri';

	const NOTES: Record<string, string> = {
		dri: 'DRI is the composite of Hazard, Exposure and Vulnerability.',
		dhi: 'DHI is monthly — pick a year below and a month here.',
		dei: 'DEI reflects exposure of agricultural land and population to drought.',
		dvi: 'DVI reflects socio-economic vulnerability to drought impacts.'
	};
	const note = $derived(NOTES[droughtState.selectedIndicator]);

	const indicator = $derived(droughtState.selectedIndicator);
	const indicatorLabel = $derived(
		INDICATORS.find((ind) => ind.id === indicator)?.label ?? indicator.toUpperCase()
	);
	const isContinuous = $derived(indicator !== 'dri');
	const domain = $derived(droughtState.continuousDomain);
	const isMonthly = $derived(indicator === 'dhi');
	const periodLabel = $derived(
		isMonthly
			? `${String(droughtState.selectedMonth).padStart(2, '0')}/${droughtState.selectedYear}`
			: `${droughtState.selectedYear}`
	);

	

	function rangeLabel(min: number, max: number): string {
		if (min === -Infinity) return `< ${max.toFixed(2)}`;
		if (max === Infinity) return `≥ ${min.toFixed(2)}`;
		return `${min.toFixed(2)} – ${max.toFixed(2)}`;
	}

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

	{#if droughtState.selectedIndicator === 'dhi'}
		<section>
			<h2><span class="icon">📆</span> Month</h2>
			<select
				value={droughtState.selectedMonth}
				onchange={(e) => (droughtState.selectedMonth = Number(e.currentTarget.value))}
			>
				{#each Array.from({ length: 12 }, (_, i) => i + 1) as m (m)}
					<option value={m}>{String(m).padStart(2, '0')}</option>
				{/each}
			</select>
		</section>
	{/if}

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

	<section>
		<h2><span class="icon">📍</span> Boundaries</h2>
		<label class="checkbox-row">
			<input type="checkbox" bind:checked={droughtState.showNewBoundary} />
			New provincial boundaries (2025)
		</label>
	</section>

	<section>
		<h2>Legend</h2>
		<p class="legend-title">{indicatorLabel}</p>
		{#if !isContinuous}
			<div class="legend-list">
				{#each driRiskClasses() as risk (risk.label)}
					<div class="legend-row">
						<span class="swatch" style:background={risk.color}></span>
						<span class="legend-label">{risk.label}</span>
						<span class="legend-range">{rangeLabel(risk.min, risk.max)}</span>
					</div>
				{/each}
			</div>
		{:else if domain}
			<div
				class="gradient-bar"
				style:background="linear-gradient(to right, {continuousStops().join(', ')})"
			></div>
			<div class="gradient-labels">
				<span>{domain.min.toFixed(2)} (Low)</span>
				<span>{domain.max.toFixed(2)} (High)</span>
			</div>
		{:else}
			<p class="pending-note">Loading data to compute the color scale…</p>
		{/if}
	</section>

	<p class="note">{note}</p>
	
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

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
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

	.legend-title {
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
	}

	.legend-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.pending-note {
		font-size: 0.78rem;
		color: var(--ink-muted);
		background: var(--surface);
		padding: 0.6rem;
		border-radius: 8px;
		margin: 0;
	}

	.gradient-bar {
		height: 14px;
		border-radius: 999px;
	}

	.gradient-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--ink-muted);
		margin-top: 0.3rem;
		font-variant-numeric: tabular-nums;
	}

	.legend-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.82rem;
	}

	.swatch {
		width: 14px;
		height: 14px;
		border-radius: 3px;
		flex-shrink: 0;
	}

	.legend-label {
		flex: 1;
	}

	.legend-range {
		color: var(--ink-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
