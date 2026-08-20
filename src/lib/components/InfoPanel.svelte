<script lang="ts">
	import { droughtState } from '$lib/state/drought-state.svelte';
	import { RISK_CLASSES, INDICATORS, indicatorValue, riskClassFor } from '$lib/dri';
	import { resolve } from '$app/paths';

	const indicator = $derived(droughtState.selectedIndicator);
	const indicatorLabel = $derived(
		INDICATORS.find((ind) => ind.id === indicator)?.label ?? indicator.toUpperCase()
	);

	const province = $derived(droughtState.selectedProvince);
	const currentValue = $derived(
		province ? indicatorValue(province, indicator, droughtState.selectedYear) : null
	);
	const currentRisk = $derived(riskClassFor(currentValue));

	const trend = $derived.by(() => {
		if (!province) return [];
		return droughtState.years.map((year) => ({
			year,
			value: indicatorValue(province, indicator, year)
		}));
	});

	function rangeLabel(min: number, max: number): string {
		if (min === -Infinity) return `< ${max.toFixed(2)}`;
		if (max === Infinity) return `≥ ${min.toFixed(2)}`;
		return `${min.toFixed(2)} – ${max.toFixed(2)}`;
	}

	// Chart geometry: fixed 240x112 viewBox, plot area x:[20,220] y:[15,75] for value range [0,1].
	const PLOT_X0 = 20;
	const PLOT_X1 = 220;
	const PLOT_Y0 = 15; // value = 1
	const PLOT_Y1 = 75; // value = 0

	function xFor(i: number, n: number): number {
		return n <= 1 ? PLOT_X0 : PLOT_X0 + (i * (PLOT_X1 - PLOT_X0)) / (n - 1);
	}
	function yFor(value: number): number {
		return PLOT_Y1 - value * (PLOT_Y1 - PLOT_Y0);
	}

	const linePoints = $derived(
		trend
			.map((p, i) => (p.value == null ? null : `${xFor(i, trend.length)},${yFor(p.value)}`))
			.filter((v): v is string => v != null)
			.join(' ')
	);
</script>

<aside class="panel info-panel">
	<section>
		<h2>Legend</h2>
		<p class="legend-title">{indicatorLabel}</p>
		<div class="legend-list">
			{#each RISK_CLASSES as risk (risk.label)}
				<div class="legend-row">
					<span class="swatch" style:background={risk.color}></span>
					<span class="legend-label">{risk.label}</span>
					<span class="legend-range">{rangeLabel(risk.min, risk.max)}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2>Province information</h2>
		{#if province}
			<div class="province-row">
				<span class="province-name">{province.ADM1_EN}</span>
			</div>
			<div class="stat-row">
				<span>{indicator.toUpperCase()} ({droughtState.selectedYear})</span>
				<span class="stat-value" style:color={currentRisk?.color}>
					{currentValue != null ? currentValue.toFixed(2) : '—'}
					{#if currentRisk}<span class="risk-badge" style:background={currentRisk.color}
							>{currentRisk.label}</span
						>{/if}
				</span>
			</div>

			{#if trend.length}
				<p class="chart-title">{indicator.toUpperCase()} trend ({province.ADM1_EN})</p>
				<svg
					class="trend-chart"
					viewBox="0 0 240 112"
					role="img"
					aria-label="{indicator.toUpperCase()} trend by year"
				>
					<line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} class="axis-line" />
					<line x1={PLOT_X0} y1={yFor(0.5)} x2={PLOT_X1} y2={yFor(0.5)} class="grid-line" />
					{#if linePoints}
						<polyline points={linePoints} class="trend-line" />
					{/if}
					{#each trend as p, i (p.year)}
						{#if p.value != null}
							{@const risk = riskClassFor(p.value)}
							{@const isSelected = p.year === droughtState.selectedYear}
							<text
								x={xFor(i, trend.length)}
								y={yFor(p.value) - 8}
								class="value-label"
								text-anchor="middle">{p.value.toFixed(2)}</text
							>
							<circle
								cx={xFor(i, trend.length)}
								cy={yFor(p.value)}
								r={isSelected ? 5.5 : 4}
								fill={risk?.color ?? '#999'}
								class="trend-dot"
								class:selected={isSelected}
							>
								<title>{p.year}: {p.value.toFixed(2)} ({risk?.label})</title>
							</circle>
						{/if}
						<text x={xFor(i, trend.length)} y={PLOT_Y1 + 14} class="year-label" text-anchor="middle"
							>{p.year}</text
						>
					{/each}
				</svg>
			{/if}
		{:else}
			<p class="empty-hint">Click a province on the map to see its details.</p>
		{/if}
	</section>

	<section>
		<h2>Download data</h2>
		<div class="download-row">
			<a class="download-btn geojson" href={resolve('/api/dri')} download="VN-DRAW_DRI.geojson"
				>GeoJSON</a
			>
			<a class="download-btn csv" href={resolve('/api/downloads/dri-csv')} download>CSV</a>
			<span class="download-btn disabled" title="Not yet available">Metadata (PDF)</span>
		</div>
	</section>
</aside>

<style>
	.panel {
		background: var(--surface);
		color: var(--ink);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.info-panel {
		width: 300px;
		padding: 1rem;
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

	.province-name {
		font-weight: 700;
		font-size: 1rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	.stat-value {
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.risk-badge {
		color: white;
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
	}

	.chart-title {
		font-size: 0.78rem;
		color: var(--ink-muted);
		margin: 0.9rem 0 0.2rem;
	}

	.trend-chart {
		width: 100%;
		height: auto;
	}

	.axis-line {
		stroke: var(--border);
		stroke-width: 1;
	}

	.grid-line {
		stroke: var(--border);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}

	.trend-line {
		fill: none;
		stroke: var(--ink-secondary);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.trend-dot {
		stroke: var(--surface);
		stroke-width: 1.5;
	}

	.trend-dot.selected {
		stroke: var(--accent);
		stroke-width: 2;
	}

	.value-label {
		font-size: 7.5px;
		fill: var(--ink-muted);
	}

	.year-label {
		font-size: 7.5px;
		fill: var(--ink-muted);
	}

	.empty-hint {
		font-size: 0.82rem;
		color: var(--ink-muted);
		margin: 0;
	}

	.download-row {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.download-btn {
		text-align: center;
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.45rem;
		border-radius: 6px;
		text-decoration: none;
		color: white;
	}

	.download-btn.geojson {
		background: #16a34a;
	}

	.download-btn.csv {
		background: #2563eb;
	}

	.download-btn.disabled {
		background: var(--surface-2);
		color: var(--ink-muted);
		cursor: not-allowed;
	}
</style>
