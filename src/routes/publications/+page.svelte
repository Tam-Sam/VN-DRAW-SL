<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';

	interface Publication {
		authors: string;
		year: number;
		title: string;
		venue: string;
		type: 'Journal Article' | 'Conference Paper' | 'Technical Report';
		doi?: string;
	}

	const publications: Publication[] = [
		{
			authors: 'Le, T., Sun, Q.C., Tran, T.D., Choy, S., Li, H. and Kuleshov, Y.',
			year: 2026,
			title:
				'Characterizing High-Resolution Uneven Drought Conditions in Vietnam for More Reliable Hazard Assessment',
			venue: 'Earth System and Environment',
			type: 'Journal Article',
			doi: '10.1007/s41748-026-01050-5'
		},
		{
			authors:
				'Ngo, T.T., Das, N.N., Chansopheaktra, S., Luong, T.T., Chanbora, K., Tran, D.T., Vu, T.T., Luong, H.D., Jayasinghe, S., Le, T., Khem, S., Ly, M.',
			year: 2025,
			title:
				'Strengthening Food Security via Strategic Agricultural Water Management: A Case Study on Assessing Water Demand from High-Resolution SAR Remote Sensing for Enhanced Operational Plans in Water Works Systems of Vietnam and Cambodia',
			venue: 'Asia-Pacific Network for Global Change Research',
			type: 'Technical Report'
		},
		{
			authors: 'Le, T., Nie, H. R., Li, H., Tran, T. D., Sun, C., Choy, S. & Kuleshov, Y.',
			year: 2025,
			title:
				'New approach to develop a standardized precipitation evapotranspiration index (SPEI) in Vietnam applying Machine Learning',
			venue: 'IGARSS 2025 - 2025 IEEE International Geoscience and Remote Sensing Symposium',
			type: 'Conference Paper',
			doi: '10.1109/IGARSS55030.2025.11243177'
		},
		{
			authors: 'Le, T., Sun, Q.C., Tran, T.D., Choy, S. and Kuleshov, Y.',
			year: 2025,
			title:
				'Spatial-Temporal Analysis of Agricultural Drought Risk: Insights from a Vietnam Case Study',
			venue: 'Frontiers in Earth Science',
			type: 'Journal Article',
			doi: '10.3389/feart.2025.1564900'
		},
		{
			authors: 'Le, T., Sun, C., Choy, S., Kuleshov, Y., & Tran, T. D.',
			year: 2024,
			title:
				'Agricultural drought risk assessments: a comprehensive review of indicators, algorithms, and validation for informed adaptations',
			venue: 'Geomatics, Natural Hazards and Risk',
			type: 'Journal Article',
			doi: '10.1080/19475705.2024.2383774'
		},
		{
			authors: 'Le, T., Sun, C., Choy, S. and Kuleshov, Y.',
			year: 2021,
			title: 'Regional drought risk assessment in the Central Highlands and the South of Vietnam',
			venue: 'Geomatics, Natural Hazards, and Risk',
			type: 'Journal Article',
			doi: '10.1080/19475705.2021.1998232'
		}
	];
</script>

<PageShell title="Publications">
	<ol class="pub-list">
		{#each publications as pub (pub.doi ?? pub.title)}
			<li class="pub-entry">
				<div class="pub-header">
					<span class="pub-type">{pub.type}</span>
					<span class="pub-year">{pub.year}</span>
				</div>
				<p class="pub-authors">{pub.authors}</p>
				<p class="pub-title">
					{#if pub.doi}
						<a href="https://doi.org/{pub.doi}" target="_blank" rel="noopener noreferrer"
							>{pub.title}</a
						>
					{:else}
						{pub.title}
					{/if}
				</p>
				<p class="pub-venue">
					{pub.venue}{#if pub.doi}, DOI:
						<a href="https://doi.org/{pub.doi}" target="_blank" rel="noopener noreferrer"
							>{pub.doi}</a
						>{/if}
				</p>
			</li>
		{/each}
	</ol>
</PageShell>

<style>
	.pub-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.pub-entry {
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.pub-entry:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}

	.pub-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.4rem;
	}

	.pub-type {
		font-size: 0.68rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--accent);
		background: var(--surface-2);
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
	}

	.pub-year {
		font-size: 0.82rem;
		color: var(--ink-muted);
		font-variant-numeric: tabular-nums;
	}

	.pub-authors {
		margin: 0 0 0.3rem;
		font-size: 0.85rem;
		color: var(--ink-secondary);
	}

	.pub-title {
		margin: 0 0 0.3rem;
		font-size: 1rem;
		font-weight: 700;
		color: var(--ink);
		line-height: 1.4;
	}

	.pub-title a {
		color: inherit;
		text-decoration: none;
	}

	.pub-title a:hover {
		text-decoration: underline;
	}

	.pub-venue {
		margin: 0;
		font-size: 0.85rem;
		font-style: italic;
		color: var(--ink-secondary);
	}

	.pub-venue a {
		color: var(--accent);
		font-style: normal;
		text-decoration: none;
	}

	.pub-venue a:hover {
		text-decoration: underline;
	}
</style>
