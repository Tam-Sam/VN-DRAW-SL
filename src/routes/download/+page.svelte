<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import PageShell from '$lib/components/PageShell.svelte';
	import { droughtState } from '$lib/state/drought-state.svelte';
	import {
		INDICATORS,
		indicatorValue,
		riskInfoFor,
		type IndicatorId
	} from '$lib/dri';

	let provinceName = $state<string | null>(droughtState.selectedProvinceName);

	const indicator = $derived(droughtState.selectedIndicator);
	const indicatorLabel = $derived(
		INDICATORS.find((item) => item.id === indicator)?.label ?? indicator.toUpperCase()
	);
	const isMonthly = $derived(indicator === 'dhi');
	const provinceOptions = $derived(
		(droughtState.currentData?.features ?? [])
			.map((feature) => feature.properties.ADM1_EN)
			.filter((name): name is string => Boolean(name))
			.sort()
	);
	const selectedProvince = $derived.by(() => {
		const name = provinceName ?? droughtState.selectedProvinceName ?? provinceOptions[0];
		return droughtState.currentData?.features.find((feature) => feature.properties.ADM1_EN === name)
			?.properties;
	});

	const geoJsonHref = $derived.by(() => {
		if (indicator === 'dhi') {
			return resolve('/api/dhi/[year]', { year: String(droughtState.selectedYear) });
		}
		const paths: Record<Exclude<IndicatorId, 'dhi'>, string> = {
			dri: resolve('/api/dri'),
			dei: resolve('/api/dei'),
			dvi: resolve('/api/dvi')
		};
		return paths[indicator];
	});
	const csvHref = $derived.by(() => {
		if (indicator === 'dhi') return null;
		const paths: Record<Exclude<IndicatorId, 'dhi'>, string> = {
			dri: resolve('/api/downloads/dri-csv'),
			dei: resolve('/api/downloads/dei-csv'),
			dvi: resolve('/api/downloads/dvi-csv')
		};
		return paths[indicator];
	});

	const chartValues = $derived.by(() => {
		if (!selectedProvince) return [];
		if (isMonthly) {
			return Array.from({ length: 12 }, (_, index) => ({
				label: String(index + 1).padStart(2, '0'),
				value: indicatorValue(selectedProvince, indicator, droughtState.selectedYear, index + 1)
			}));
		}
		return droughtState.years.map((year) => ({
			label: String(year),
			value: indicatorValue(selectedProvince, indicator, year)
		}));
	});

	const chartDomain = $derived.by(() => {
		const values = chartValues
			.map((point) => point.value)
			.filter((value): value is number => value != null);
		if (!values.length) return { min: 0, max: 1 };
		const min = Math.min(...values);
		const max = Math.max(...values);
		const padding = Math.max((max - min) * 0.25, 0.03);
		return { min: min - padding, max: max + padding };
	});

	const linePoints = $derived(
		chartValues
			.map((point, index) => {
				if (point.value == null) return null;
				return `${xFor(index, chartValues.length)},${yFor(point.value)}`;
			})
			.filter((point): point is string => point != null)
			.join(' ')
	);

	const PLOT_X0 = 20;
	const PLOT_X1 = 280;
	const PLOT_Y0 = 15;
	const PLOT_Y1 = 90;

	function xFor(index: number, count: number): number {
		return count <= 1 ? PLOT_X0 : PLOT_X0 + (index * (PLOT_X1 - PLOT_X0)) / (count - 1);
	}

	function yFor(value: number): number {
		const span = chartDomain.max - chartDomain.min || 1;
		return PLOT_Y1 - ((value - chartDomain.min) / span) * (PLOT_Y1 - PLOT_Y0);
	}

	function selectIndicator(next: IndicatorId) {
		droughtState.selectedIndicator = next;
		if (next === 'dhi') droughtState.selectedMonth = 12;
		void droughtState.ensureLoaded(next, droughtState.selectedYear);
	}

	function selectProvince(name: string) {
		provinceName = name;
		droughtState.selectedProvinceName = name;
	}

	$effect(() => {
		void droughtState.ensureLoaded(indicator, droughtState.selectedYear);
	});

	onMount(() => {
		void droughtState.ensureLoaded(droughtState.selectedIndicator, droughtState.selectedYear);
	});
</script>

<PageShell title="Download Data">
	<div class="download-page">
		<p class="intro">
			Select an indicator and time period to download the VN-DRAW spatial data. GeoJSON files
			include the administrative boundaries and indicator attributes; CSV files contain the source
			tabular data for the composite indicators.
		</p>

		<section class="selector-card" aria-labelledby="data-selection-heading">
			<h2 id="data-selection-heading"><span class="icon">☰</span> Data selection</h2>

			<div class="selector-grid">
				<div class="selector-group">
					<span class="label">Indicator</span>
					<div class="indicator-list" role="radiogroup" aria-label="Indicator">
						{#each INDICATORS as item (item.id)}
							<label class="radio-row">
								<input
									type="radio"
									name="download-indicator"
									checked={item.id === indicator}
									onchange={() => selectIndicator(item.id)}
								/>
								{item.label}
							</label>
						{/each}
					</div>
				</div>

				<div class="selector-group">
					<label class="label" for="download-year">Year</label>
					{#if droughtState.years.length}
						<input
							id="download-year"
							type="range"
							min={0}
							max={droughtState.years.length - 1}
							step="1"
							value={droughtState.years.indexOf(droughtState.selectedYear)}
							oninput={(event) => {
								const year = droughtState.years[Number(event.currentTarget.value)];
								if (year != null) droughtState.selectedYear = year;
							}}
						/>
						<div class="year-ticks">
							{#each droughtState.years as year (year)}
								<button
									type="button"
									class:active={year === droughtState.selectedYear}
									class="year-tick"
									onclick={() => (droughtState.selectedYear = year)}>{year}</button
								>
							{/each}
						</div>
					{:else}
						<p class="pending-note">Loading available years…</p>
					{/if}
				</div>

				{#if isMonthly}
					<div class="selector-group">
						<label class="label" for="download-month">Month</label>
						<select id="download-month" bind:value={droughtState.selectedMonth}>
							{#each Array.from({ length: 12 }, (_, index) => index + 1) as month (month)}
								<option value={month}>{String(month).padStart(2, '0')}</option>
							{/each}
						</select>
					</div>
				{/if}

				<div class="selector-group">
					<label class="label" for="download-province">Preview province</label>
					{#if provinceOptions.length}
						<select
							id="download-province"
							value={provinceName ?? droughtState.selectedProvinceName ?? provinceOptions[0]}
							onchange={(event) => selectProvince(event.currentTarget.value)}
						>
							{#each provinceOptions as name (name)}
								<option value={name}>{name}</option>
							{/each}
						</select>
					{:else}
						<p class="pending-note">Loading provinces…</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="preview-card" aria-labelledby="preview-heading">
			<div class="section-heading">
				<div>
					<h2 id="preview-heading"><span class="icon">⌁</span> Data preview</h2>
					<p class="section-note">{indicatorLabel} values for the selected province</p>
				</div>
				{#if droughtState.loading}
					<span class="status">Loading data…</span>
				{/if}
			</div>

			{#if selectedProvince && chartValues.length}
				<div class="chart-wrap">
					<svg
						class="trend-chart"
						viewBox="0 0 300 128"
						role="img"
						aria-label="{indicatorLabel} values for {selectedProvince.ADM1_EN}"
					>
						<line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} class="axis-line" />
						{#if linePoints}<polyline points={linePoints} class="trend-line" />{/if}
						{#each chartValues as point, index (point.label)}
							{#if point.value != null}
								{@const risk = riskInfoFor(point.value, indicator, droughtState.continuousDomain)}
								<circle
									cx={xFor(index, chartValues.length)}
									cy={yFor(point.value)}
									r={point.label ===
									(isMonthly
										? String(droughtState.selectedMonth).padStart(2, '0')
										: String(droughtState.selectedYear))
										? 5.5
										: 4}
									fill={risk?.color ?? '#999'}
									class="trend-dot"
								>
									<title>{point.label}: {point.value.toFixed(2)} ({risk?.label ?? 'Unknown'})</title
									>
								</circle>
							{/if}
							<text
								x={xFor(index, chartValues.length)}
								y={PLOT_Y1 + 16}
								class="axis-label"
								text-anchor="middle">{point.label}</text
							>
						{/each}
					</svg>
				</div>
			{:else}
				<p class="empty-hint">
					Select a province after the indicator data has loaded to preview its values.
				</p>
			{/if}
		</section>

		<section class="download-card" aria-labelledby="download-heading">
			<div>
				<h2 id="download-heading"><span class="icon">⇩</span> Download selected data</h2>
				<p class="section-note">
					{indicatorLabel} · {isMonthly
						? `${String(droughtState.selectedMonth).padStart(2, '0')}/`
						: ''}{droughtState.selectedYear}
				</p>
			</div>
			<div class="download-row">
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					class="download-btn geojson"
					href={geoJsonHref}
					download="VN-DRAW_{indicator.toUpperCase()}_{droughtState.selectedYear}.geojson"
					>GeoJSON</a
				>
				{#if csvHref}
					<a class="download-btn csv" href={csvHref} download>CSV</a>
				{:else}
					<span class="download-btn disabled" title="Monthly DHI CSV is not available"
						>CSV unavailable</span
					>
				{/if}
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
			<p class="download-note">
				GeoJSON downloads are available for the selected year. CSV downloads cover the complete
				2015–2022 source tables for DRI, DEI, and DVI.
			</p>
		</section>
	</div>
</PageShell>

<style>
	.download-page {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.intro {
		margin: 0;
		font-size: 0.92rem;
		color: var(--ink);
	}

	.selector-card,
	.preview-card,
	.download-card {
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface-2);
	}

	h2 {
		margin: 0 0 0.8rem;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--ink-muted);
	}

	.icon {
		margin-right: 0.25rem;
	}

	.selector-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.selector-group {
		min-width: 0;
	}

	.label {
		display: block;
		margin-bottom: 0.45rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink-muted);
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
		padding: 0.2rem 0.55rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink-muted);
		font-size: 0.75rem;
		cursor: pointer;
	}

	.year-tick.active {
		border-color: var(--accent);
		background: var(--accent);
		color: white;
		font-weight: 600;
	}

	select {
		width: 100%;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--ink);
		font-size: 0.85rem;
	}

	.section-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-heading h2,
	.download-card h2 {
		margin-bottom: 0.25rem;
	}

	.section-note,
	.download-note,
	.empty-hint,
	.pending-note {
		margin: 0;
		color: var(--ink-muted);
		font-size: 0.78rem;
	}

	.status {
		color: var(--accent);
		font-size: 0.75rem;
	}

	.chart-wrap {
		margin-top: 0.75rem;
	}

	.trend-chart {
		width: 100%;
		height: auto;
	}

	.axis-line {
		stroke: var(--border);
		stroke-width: 1;
	}

	.trend-line {
		fill: none;
		stroke: var(--ink-secondary);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.trend-dot {
		stroke: var(--surface-2);
		stroke-width: 1.5;
	}

	.axis-label {
		fill: var(--ink-muted);
		font-size: 7px;
	}

	.download-card {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.download-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.download-btn {
		flex: 1;
		min-width: 130px;
		padding: 0.55rem 0.75rem;
		border-radius: 6px;
		color: white;
		font-size: 0.82rem;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
	}

	.download-btn.geojson {
		background: #16a34a;
	}

	.download-btn.csv {
		background: #2563eb;
	}

	.download-btn.disabled {
		background: var(--surface);
		color: var(--ink-muted);
		cursor: not-allowed;
	}

	@media (max-width: 560px) {
		.selector-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
