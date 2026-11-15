<script lang="ts">
	import { droughtState } from '$lib/state/drought-state.svelte';
	import {
		INDICATORS,
		indicatorValue,
		riskInfoFor,
		driRiskClasses,
		continuousStops,
		type IndicatorId
	} from '$lib/dri';
	import { resolve } from '$app/paths';

	type ProvinceRegion =
		| 'Northwest'
		| 'Northeast'
		| 'Central Highland'
		| 'Mekong Delta'
		| 'North Central'
		| 'South Central'
		| 'Southeast';

	type Recommendation = {
		text: string;
		severity: 'low' | 'moderate' | 'high' | 'urgent';
		color: string;
	};

	const recommendation = (
		text: string,
		severity: Recommendation['severity'],
		color: string
	): Recommendation => ({ text, severity, color });

	function translucent(hex: string): string {
		const value = parseInt(hex.slice(1), 16);
		const red = (value >> 16) & 255;
		const green = (value >> 8) & 255;
		const blue = value & 255;
		return `rgba(${red}, ${green}, ${blue}, 0.5)`;
	}

	function warningTextColor(label: string): string {
		return label === 'Low' || label === 'Moderate' ? 'var(--ink)' : 'white';
	}

	const PROVINCE_REGIONS: Record<string, ProvinceRegion> = {
		'Dien Bien': 'Northwest',
		'Hoa Binh': 'Northwest',
		'Lai Chau': 'Northwest',
		'Lao Cai': 'Northwest',
		'Son La': 'Northwest',
		'Yen Bai': 'Northwest',
		'Bac Giang': 'Northeast',
		'Bac Kan': 'Northeast',
		'Bac Ninh': 'Northeast',
		'Cao Bang': 'Northeast',
		'Ha Giang': 'Northeast',
		'Ha Nam': 'Northeast',
		'Ha Noi': 'Northeast',
		'Hai Duong': 'Northeast',
		'Hai Phong': 'Northeast',
		'Hung Yen': 'Northeast',
		'Lang Son': 'Northeast',
		'Nam Dinh': 'Northeast',
		'Ninh Binh': 'Northeast',
		'Phu Tho': 'Northeast',
		'Quang Ninh': 'Northeast',
		'Thai Binh': 'Northeast',
		'Thai Nguyen': 'Northeast',
		'Tuyen Quang': 'Northeast',
		'Vinh Phuc': 'Northeast',
		'Dak Lak': 'Central Highland',
		'Dak Nong': 'Central Highland',
		'Gia Lai': 'Central Highland',
		'Kon Tum': 'Central Highland',
		'Lâm Đồng': 'Central Highland',
		'An Giang': 'Mekong Delta',
		'Bac Lieu': 'Mekong Delta',
		'Ben Tre': 'Mekong Delta',
		'Ca Mau': 'Mekong Delta',
		'Can Tho': 'Mekong Delta',
		'Dong Thap': 'Mekong Delta',
		'Hau Giang': 'Mekong Delta',
		'Kien Giang': 'Mekong Delta',
		'Long An': 'Mekong Delta',
		'Soc Trang': 'Mekong Delta',
		'Tien Giang': 'Mekong Delta',
		'Tra Vinh': 'Mekong Delta',
		'Vinh Long': 'Mekong Delta',
		'Ha Tinh': 'North Central',
		'Nghe An': 'North Central',
		'Quang Binh': 'North Central',
		'Quang Tri': 'North Central',
		'Thanh Hoa': 'North Central',
		'Thua Thien Hue': 'North Central',
		'Binh Dinh': 'South Central',
		'Binh Thuan': 'South Central',
		'Da Nang': 'South Central',
		'Khanh Hoa': 'South Central',
		'Ninh Thuan': 'South Central',
		'Phu Yen': 'South Central',
		'Quang Nam': 'South Central',
		'Quang Ngai': 'South Central',
		'Ba Ria - Vung Tau': 'Southeast',
		'Binh Duong': 'Southeast',
		'Binh Phuoc': 'Southeast',
		'Dong Nai': 'Southeast',
		'Ho Chi Minh': 'Southeast',
		'Tay Ninh': 'Southeast'
	};

	const RECOMMENDATIONS_BY_REGION: Record<ProvinceRegion, Recommendation[]> = {
		Northwest: [
			recommendation(
				'Conduct more detailed drought risk research on specific regional drought patterns and impacts.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Enhance monitoring of seasonal drought patterns to track drought onset and plan critical crop activities, such as sowing and harvesting, accordingly.',
				'low',
				'#a6d96a'
			),
			recommendation(
				'Invest in drought-tolerant crop varieties suitable for local conditions.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Improve irrigation infrastructure and efficient water management practices for drought periods.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Diversify economic activities by encouraging non-agricultural livelihoods to reduce dependence on farming.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Strengthen agricultural education and training toward drought-resistant agricultural practices for farmers.',
				'moderate',
				'#a6d96a'
			),
			recommendation(
				'Provide post-drought financial relief to support affected farmers and promote drought insurance programs.',
				'urgent',
				'#d7191c'
			)
		],
		Northeast: [
			recommendation(
				'Conduct more detailed drought risk research on specific regional drought patterns and impacts.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Enhance monitoring of seasonal drought patterns to track drought onset and plan critical crop activities, such as sowing and harvesting, accordingly.',
				'low',
				'#a6d96a'
			),
			recommendation(
				'Invest in drought-tolerant crop varieties suitable for local conditions.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Improve irrigation infrastructure and efficient water management practices for drought periods.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Diversify economic activities by encouraging non-agricultural livelihoods to reduce dependence on farming.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Strengthen agricultural education and training toward drought-resistant agricultural practices for farmers.',
				'moderate',
				'#a6d96a'
			),
			recommendation(
				'Provide post-drought financial relief to support affected farmers and promote drought insurance programs.',
				'urgent',
				'#d7191c'
			)
		],
		'Central Highland': [
			recommendation(
				'Conduct more detailed drought risk research on specific regional drought patterns and impacts.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Enhance monitoring of seasonal drought patterns to track drought onset and plan critical crop activities, such as sowing and harvesting, accordingly.',
				'low',
				'#a6d96a'
			),
			recommendation(
				'Invest in drought-tolerant crop varieties suitable for local conditions.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Improve irrigation infrastructure and efficient water management practices for drought periods.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Diversify economic activities by encouraging non-agricultural livelihoods to reduce dependence on farming.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Strengthen agricultural education and training toward drought-resistant agricultural practices for farmers.',
				'moderate',
				'#a6d96a'
			),
			recommendation(
				'Provide post-drought financial relief to support affected farmers and promote drought insurance programs.',
				'urgent',
				'#d7191c'
			)
		],
		'Mekong Delta': [
			recommendation(
				'Conduct more detailed drought risk research on specific regional drought patterns and impacts.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Enhance monitoring of seasonal drought patterns to track drought onset and plan critical crop activities, such as sowing and harvesting, accordingly.',
				'low',
				'#a6d96a'
			),
			recommendation(
				'Invest in drought-tolerant crop varieties suitable for local conditions.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Improve irrigation infrastructure and efficient water management practices for drought periods.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Diversify economic activities by encouraging non-agricultural livelihoods to reduce dependence on farming.',
				'moderate',
				'#ffffc0'
			),
			recommendation(
				'Strengthen agricultural education and training toward drought-resistant agricultural practices for farmers.',
				'moderate',
				'#a6d96a'
			),
			recommendation(
				'Provide post-drought financial relief to support affected farmers and promote drought insurance programs.',
				'urgent',
				'#d7191c'
			)
		],
		'North Central': [
			recommendation(
				'Encourage further drought risk research to refine adaptation strategies.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Continue monitoring typical seasonal drought patterns to support crop timing practices.',
				'low',
				'#a6d96a'
			),
			recommendation('Shift toward less agriculture-dependent work.', 'moderate', '#ffffc0'),
			recommendation(
				'Build community knowledge and capacity for dealing with seasonal droughts and resilience-building practices.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Implement modern irrigation technologies to optimize water usage, especially in the South Central region.',
				'urgent',
				'#d7191c'
			)
		],
		'South Central': [
			recommendation(
				'Encourage further drought risk research to refine adaptation strategies.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Continue monitoring typical seasonal drought patterns to support crop timing practices.',
				'low',
				'#a6d96a'
			),
			recommendation('Shift toward less agriculture-dependent work.', 'moderate', '#ffffc0'),
			recommendation(
				'Build community knowledge and capacity for dealing with seasonal droughts and resilience-building practices.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Implement modern irrigation technologies to optimize water usage, especially in the South Central region.',
				'urgent',
				'#d7191c'
			)
		],
		Southeast: [
			recommendation(
				'Continue monitoring to ensure preparedness, with less emphasis on immediate agricultural impacts.',
				'low',
				'#1a9641'
			),
			recommendation(
				'Expand economic activities into more sustainable and diversified sectors.',
				'moderate',
				'#a6d96a'
			),
			recommendation(
				'Focus on water efficiency and recycling in industrial operations.',
				'high',
				'#fdae61'
			),
			recommendation(
				'Integrate drought resilience into urban development plans, such as sustainable water infrastructure.',
				'urgent',
				'#d7191c'
			)
		]
	};

	const indicator = $derived(droughtState.selectedIndicator);
	const indicatorLabel = $derived(
		INDICATORS.find((ind) => ind.id === indicator)?.label ?? indicator.toUpperCase()
	);
	const isContinuous = $derived(indicator !== 'dri');
	const domain = $derived(droughtState.continuousDomain);

	// The selected province is just a name (droughtState.selectedProvinceName),
	// carried across indicator switches — look its properties up fresh in
	// whichever dataset is currently active, since each indicator has its own
	// FeatureCollection (and DHI has one per year on top of that).
	const province = $derived.by(() => {
		const name = droughtState.selectedProvinceName;
		const fc = droughtState.currentData;
		if (!name || !fc) return null;
		return fc.features.find((f) => f.properties.ADM1_EN === name)?.properties ?? null;
	});
	const provinceRegion = $derived(
		droughtState.selectedProvinceName
			? (PROVINCE_REGIONS[droughtState.selectedProvinceName] ?? null)
			: null
	);
	const provinceRecommendations = $derived(
		provinceRegion ? RECOMMENDATIONS_BY_REGION[provinceRegion] : []
	);
	const currentValue = $derived(
		province
			? indicatorValue(province, indicator, droughtState.selectedYear, droughtState.selectedMonth)
			: null
	);
	const currentRisk = $derived(riskInfoFor(currentValue, indicator, domain));
	const riskDisplayColor = $derived(
		currentRisk?.label === 'Moderate' ? '#b8860b' : currentRisk?.color
	);

	const trend = $derived.by(() => {
		const name = droughtState.selectedProvinceName;
		if (!name) return [];
		if (indicator === 'dhi') {
			return droughtState.years.map((year) => {
				const data = droughtState.dataFor('dhi', year);
				const properties = data?.features.find((f) => f.properties.ADM1_EN === name)?.properties;
				return {
					year,
					value: properties
						? indicatorValue(properties, indicator, year, droughtState.selectedMonth)
						: null
				};
			});
		}
		if (!province) return [];
		return droughtState.years.map((year) => ({
			year,
			value: indicatorValue(province, indicator, year, droughtState.selectedMonth)
		}));
	});

	$effect(() => {
		if (indicator !== 'dhi') return;
		for (const year of droughtState.years) {
			void droughtState.ensureLoaded('dhi', year);
		}
	});

	const geoJsonHref = $derived.by(() => {
		if (indicator === 'dhi')
			return resolve('/api/dhi/[year]', { year: String(droughtState.selectedYear) });
		const paths: Record<Exclude<IndicatorId, 'dhi'>, string> = {
			dri: resolve('/api/dri'),
			dei: resolve('/api/dei'),
			dvi: resolve('/api/dvi')
		};
		return paths[indicator];
	});
	const csvHref = $derived.by(() => {
		if (indicator === 'dhi') return null; // source CSVs don't cleanly cover 2015-2022, see downloads/data_monthlyDHI
		const paths: Record<Exclude<IndicatorId, 'dhi'>, string> = {
			dri: resolve('/api/downloads/dri-csv'),
			dei: resolve('/api/downloads/dei-csv'),
			dvi: resolve('/api/downloads/dvi-csv')
		};
		return paths[indicator];
	});

	function rangeLabel(min: number, max: number): string {
		if (min === -Infinity) return `< ${max.toFixed(2)}`;
		if (max === Infinity) return `≥ ${min.toFixed(2)}`;
		return `${min.toFixed(2)} – ${max.toFixed(2)}`;
	}

	// Chart geometry: fixed 240x112 viewBox, plot area x:[20,220] y:[15,75].
	const PLOT_X0 = 20;
	const PLOT_X1 = 220;
	const PLOT_Y0 = 15; // top of plot area
	const PLOT_Y1 = 75; // bottom of plot area

	function xFor(i: number, n: number): number {
		return n <= 1 ? PLOT_X0 : PLOT_X0 + (i * (PLOT_X1 - PLOT_X0)) / (n - 1);
	}

	// The y-axis zooms to this trend's own min/max (a sparkline, not a chart
	// meant for cross-province comparison) instead of the full 0–1 DRI range, so
	// year-to-year and risk-class differences are actually visible instead of
	// compressed into a sliver — real DRI values cluster tightly (e.g. 0.53–0.64).
	// Risk category is still carried by dot color (fixed, absolute breakpoints),
	// never by position alone.
	const trendDomain = $derived.by(() => {
		const values = trend.map((p) => p.value).filter((v): v is number => v != null);
		if (values.length === 0) return { min: 0, max: 1 };
		const dataMin = Math.min(...values);
		const dataMax = Math.max(...values);
		const pad = Math.max((dataMax - dataMin) * 0.25, 0.03);
		return { min: dataMin - pad, max: dataMax + pad };
	});

	function yFor(value: number): number {
		const { min, max } = trendDomain;
		const span = max - min || 1;
		return PLOT_Y1 - ((value - min) / span) * (PLOT_Y1 - PLOT_Y0);
	}

	// DRI's discrete class boundaries that fall inside the current zoomed
	// domain, drawn as reference lines so it's clear exactly where the trend
	// crosses from one risk class into another. DHI/DEI/DVI are a continuous
	// gradient with no fixed boundaries, so there's nothing to draw for those.
	const visibleBoundaries = $derived(
		indicator === 'dri'
			? driRiskClasses()
					.slice(1)
					.map((c) => c.min)
					.filter((b) => b > trendDomain.min && b < trendDomain.max)
			: []
	);

	const linePoints = $derived(
		trend
			.map((p, i) => (p.value == null ? null : `${xFor(i, trend.length)},${yFor(p.value)}`))
			.filter((v): v is string => v != null)
			.join(' ')
	);
</script>

<aside class="panel info-panel">
	<!-- <section>
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
	</section> -->

	{#if province && currentRisk}
		<div
			class="drought-warning"
			style:background={currentRisk.color}
			style:color={warningTextColor(currentRisk.label)}
		>
			Drought warning
		</div>
	{/if}

	<section>
		{#if province}
			<div class="province-row">
				<span class="province-name">{province.ADM1_EN}</span>
			</div>
			{#if currentRisk}
				<div class="risk-level">
					<span>Risk level: </span>
					<span class="risk-detail" style:color={riskDisplayColor}
						>Class {currentRisk.label} ({currentValue?.toFixed(2) ?? '—'})</span
					>
				</div>
			{/if}

			{#if trend.length}
				<p class="chart-title">Drought Trend ({indicator.toUpperCase()})</p>
				<svg
					class="trend-chart"
					viewBox="0 0 240 112"
					role="img"
					aria-label="{indicator.toUpperCase()} trend by year"
				>
					<line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} class="axis-line" />
					{#each visibleBoundaries as boundary (boundary)}
						<line
							x1={PLOT_X0}
							y1={yFor(boundary)}
							x2={PLOT_X1}
							y2={yFor(boundary)}
							class="grid-line"
						/>
					{/each}
					{#if linePoints}
						<polyline points={linePoints} class="trend-line" />
					{/if}
					{#each trend as p, i (p.year)}
						{#if p.value != null}
							{@const risk = riskInfoFor(p.value, indicator, domain)}
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

	<section class="recommendation-section">
		<h2>Adaptation Recommendations</h2>
		{#if province}
			{#if provinceRecommendations.length}
				<div class="recommendation-list">
					{#each provinceRecommendations as item}
						<div
							class="recommendation"
							style:background={translucent(item.color)}
							style:color="var(--ink)"
						>
							<span>{item.text}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty-hint">No recommendations are available for this region.</p>
			{/if}
		{:else}
			<p class="empty-hint">Click a province on the map to see adaptation recommendations.</p>
		{/if}
	</section>

	<section class="region-section">
		<h2>Province location category</h2>
		{#if province}
			<div class="region-value">
				<span class="province-name">{province.ADM1_EN}</span>
				<span class="region-badge">{provinceRegion ?? 'Unassigned'}</span>
			</div>
		{:else}
			<p class="empty-hint">Click a province on the map to see its location category.</p>
		{/if}
	</section>

	<!-- <section>
		<h2>Download data</h2>
		<div class="download-row"> -->
	<!-- geoJsonHref/csvHref above are always built with resolve() per indicator;
			     the lint rule just can't see through the indirection to verify that. -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<!-- <a
				class="download-btn geojson"
				href={geoJsonHref}
				download="VN-DRAW_{indicator.toUpperCase()}.geojson">GeoJSON</a
			>
			{#if csvHref}
				<a class="download-btn csv" href={csvHref} download>CSV</a>
			{:else}
				<span class="download-btn disabled" title="Not yet available">CSV</span>
			{/if}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
	<!-- <span class="download-btn disabled" title="Not yet available">Metadata (PDF)</span>
		</div>
	</section> -->
</aside>

<style>
	.panel {
		/* Matches the page background (not --surface/white) and has no border or
		   shadow — the pane reads as part of the page, not a bordered card. */
		background: var(--surface-2);
		color: var(--ink);
		border-radius: var(--radius);
	}

	.info-panel {
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
	}

	.province-name {
		font-weight: 700;
		font-size: 1rem;
	}

	.risk-level {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		font-weight: 800;
		color: var(--ink);
	}

	.risk-detail {
		font-weight: 800;
	}

	.chart-title {
		font-size: 0.94rem;
		font-weight: 700;
		color: var(--ink);
		margin: 0.9rem 0 0.2rem;
	}

	.drought-warning {
		width: 100%;
		padding: 0.4rem 0.85rem;
		border-radius: 3px;
		font-size: 1.08rem;
		font-weight: 800;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.03em;
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
		stroke: var(--surface-2);
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

	.recommendation-section {
		flex-shrink: 0;
	}

	.recommendation-list {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.recommendation {
		display: flex;
		align-items: flex-start;
		padding: 0.55rem 0.65rem;
		border-radius: 6px;
		font-size: 0.76rem;
		line-height: 1.4;
	}

	.region-section {
		margin-top: auto;
		padding-top: 0.9rem;
		border-top: 1px solid var(--border);
	}

	.region-value {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.region-badge {
		align-self: flex-start;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: var(--accent);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
	}
</style>
