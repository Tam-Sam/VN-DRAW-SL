<script lang="ts">
	import { base } from '$app/paths';
	import PageShell from '$lib/components/PageShell.svelte';

	const workflowSteps = [
		{
			title: 'Data Pre-processing and Spatial Joining (QGIS)',
			text: 'Spatial boundaries representing administrative units (provinces and districts) were imported into QGIS alongside calculated raster and tabular indices for drought hazard, exposure, vulnerability, and composite drought risk (DRI). Attribute tables were spatially linked to their respective administrative geometries, standardizing the temporal datasets from 2015 to 2022.'
		},
		{
			title: 'Cartographic Styling and Symbology',
			text: 'Standardized, intuitive color ramps were applied to classify risk levels from “Very Low” to “Very High.” Consistent symbology, map layers, and legend parameters were configured in QGIS to ensure clear readability for non-technical stakeholders and decision-makers.'
		},
		{
			title: 'Web Map Generation (qgis2web)',
			text: 'The cartographic layouts and interactive spatial layers were compiled into a client-side web mapping structure via the qgis2web extension. This plugin converts QGIS project layers, labels, and pop-up configurations directly into lightweight open-source web map libraries (Leaflet / OpenLayers), producing the foundational HTML, CSS, JavaScript, and GeoJSON files.'
		},
		{
			title: 'Frontend Customization and Hosting',
			text: 'To enhance portal functionality beyond standard template capabilities, source scripts were customized using Visual Studio Code (VS Code). The finalized static codebase is continuously version-controlled and deployed via GitHub Pages, providing high accessibility, zero hosting overhead, and rapid updates.'
		}
	];

	const enhancements = [
		'Building modular sidebars for dynamic province search and summary metrics.',
		'Integrating multi-year temporal sliders and drought trend charts.',
		'Incorporating the Drought Warning & Adaptation Recommendation matrix.',
		'Establishing reference overlays for updated administrative boundaries.'
	];

	const navigationItems = [
		['Home', 'Overview of the research background, project objectives, and introductory guide.'],
		['Map', 'The primary interactive mapping interface displaying risk dimensions and analytics.'],
		[
			"User's Manual",
			'Comprehensive documentation covering methodology, system architecture, and operating guidelines.'
		],
		[
			'Publications',
			'Peer-reviewed journal articles and research outputs underpinning the project.'
		],
		[
			'Data Download',
			'Direct access to GeoJSON, CSV, and metadata files for research exchange and validation.'
		],
		[
			'Contact',
			'Direct communication channels with the research team for technical inquiries and collaboration.'
		]
	];
</script>

<PageShell title="User Manual">
	<article class="manual">
		<p class="intro">
			This manual introduces the VN-DRAW drought portal, its research methodology, web architecture,
			and the controls used to explore agricultural drought risk across Vietnam.
		</p>

		<section>
			<h2>Drought Risk Index Methodology</h2>
			<p>
				A notable trend is the adoption of a comprehensive approach that considers all crucial risk
				components—hazard, exposure, and vulnerability—rather than concentrating solely on the
				hazard aspect. This holistic perspective ensures a more robust understanding of the
				multifaceted nature of drought risks.
			</p>
			<p>
				Moreover, the research employs index-based methods to quantitatively assess, compare, and
				monitor the intricate complexities of these risks. This methodological choice emphasizes a
				systematic and standardized approach to capturing the various dimensions of drought impact.
				In essence, the current trajectory of drought risk assessment research reflects a commitment
				to holistic frameworks, sophisticated methodologies, and cutting-edge technologies to
				capture the intricate spatial-temporal dynamics inherent in climate and socioeconomic data.
			</p>
			<p>
				This study applied comprehensive agricultural drought risk assessment to understand the
				dynamics of risk in the Vietnam context. The research workflow is demonstrated below.
			</p>
			<figure>
				<img src={`${base}/manual/image1.png`} alt="Research methodology workflow" />
				<figcaption>Figure 1. Research Methodology</figcaption>
			</figure>
		</section>

		<section>
			<h2>Web Portal Architecture and Development</h2>
			<p>
				The VN-DRAW web portal is developed using open-source geospatial tools and modern
				web-hosting infrastructure, primarily combining QGIS, the qgis2web plugin, and GitHub Pages.
			</p>
			<figure>
				<img src={`${base}/manual/image2.png`} alt="VN-DRAW web portal design flow" />
				<figcaption>Figure 2. Web Portal Design Flow</figcaption>
			</figure>

			<h3>Technical workflow</h3>
			<ol class="workflow">
				{#each workflowSteps as step}
					<li>
						<strong>{step.title}</strong>
						<span>{step.text}</span>
					</li>
				{/each}
			</ol>

			<p>The frontend customization includes:</p>
			<ul>
				{#each enhancements as enhancement}
					<li>{enhancement}</li>
				{/each}
			</ul>

			<h3>Scope and future enhancements</h3>
			<p>
				The current deployment serves as an interactive proof-of-concept demonstrating
				provincial-scale drought risk modeling across Vietnam. Ongoing development focuses on
				integrating localized datasets for high-vulnerability priority areas, including
				high-resolution commune-level indices, real-time soil moisture and meteorological updates,
				crop-specific vulnerability metrics, and localized adaptation guidance.
			</p>
		</section>

		<section>
			<h2>User Instructions</h2>
			<p>
				The VN-DRAW portal features an interactive, four-component layout designed for intuitive
				exploration of drought risk metrics, temporal trends, and targeted adaptation measures.
			</p>

			<div class="instruction-list">
				<div class="instruction">
					<h3>Bottom Navigation Bar</h3>
					<p>Switch between the primary sections of the portal:</p>
					<ul>
						{#each navigationItems as item}
							<li><strong>{item[0]}:</strong> {item[1]}</li>
						{/each}
					</ul>
				</div>

				<div class="instruction">
					<h3>Left Control Panel (Indicators &amp; Temporal Controls)</h3>
					<ul>
						<li>
							<strong>Component Selection:</strong> Select an indicator—Drought Risk (DRI), Hazard (DHI),
							Exposure (DEI), Vulnerability (DVI), or SPEI—to update the spatial visualization dynamically.
						</li>
						<li>
							<strong>Timeline Slider:</strong> Scrub across annual records (2015–2022). When examining
							Hazard (SPEI), monthly temporal steps can be toggled to observe seasonal fluctuations.
						</li>
						<li>
							<strong>Administrative Boundary Toggle:</strong> The baseline analysis relies on historical
							administrative boundaries (pre-2023). For contemporary planning, check the “New provincial
							boundaries (2025)” layer overlay as a spatial reference.
						</li>
					</ul>
				</div>

				<div class="instruction">
					<h3>Central Map Canvas &amp; Legend</h3>
					<ul>
						<li>
							<strong>Interactive Map:</strong> Pan, zoom, and select individual provinces to inspect
							localized values.
						</li>
						<li>
							<strong>Map Legend:</strong> Positioned as an overlay in the bottom-left corner of the map
							canvas, providing immediate reference to the five-tier classification scale from Very Low
							to Very High.
						</li>
					</ul>
				</div>

				<div class="instruction">
					<h3>Right Analytics Panel (Warnings &amp; Actionable Adaptation)</h3>
					<ul>
						<li>
							<strong>Province Summary:</strong> Clicking any province displays its current risk category,
							index value, and status alert.
						</li>
						<li>
							<strong>Drought Trend Chart:</strong> Renders an interactive historical trajectory (2015–2022)
							for the selected jurisdiction.
						</li>
						<li>
							<strong>Adaptation Recommendations:</strong> Provides tailored agronomic, water-management,
							and policy recommendations dynamically linked to the province's specific risk category.
						</li>
					</ul>
				</div>
			</div>

			<figure>
				<img src={`${base}/manual/image3.jpeg`} alt="VN-DRAW web portal interface" />
				<figcaption>Figure 3. VN-DRAW Web Portal Interface</figcaption>
			</figure>
		</section>
	</article>
</PageShell>

<style>
	.manual {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.intro,
	p {
		margin: 0;
	}

	.intro {
		font-size: 1rem;
		color: var(--ink);
	}

	h2 {
		margin: 0;
		padding-bottom: 0.55rem;
		border-bottom: 1px solid var(--border);
		font-size: 1.05rem;
		color: var(--ink);
	}

	h3 {
		margin: 0.35rem 0 0;
		font-size: 0.9rem;
		color: var(--ink);
	}

	p,
	li {
		font-size: 0.9rem;
	}

	ul,
	ol {
		margin: 0;
		padding-left: 1.35rem;
	}

	li + li {
		margin-top: 0.55rem;
	}

	.workflow {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding-left: 1.5rem;
	}

	.workflow li {
		padding-left: 0.2rem;
	}

	.workflow strong {
		display: block;
		margin-bottom: 0.15rem;
		color: var(--ink);
	}

	.workflow span {
		display: block;
	}

	.instruction-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.instruction {
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface-2);
	}

	.instruction h3 {
		margin: 0 0 0.55rem;
	}

	.instruction p {
		margin-bottom: 0.55rem;
	}

	.instruction strong {
		color: var(--ink);
	}

	figure {
		margin: 0.35rem 0 0;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface-2);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 6px;
	}

	figcaption {
		margin-top: 0.65rem;
		font-size: 0.78rem;
		font-style: italic;
		color: var(--ink-muted);
		text-align: center;
	}

	@media (max-width: 560px) {
		.manual {
			gap: 1.5rem;
		}

		.instruction {
			padding: 0.85rem;
		}
	}
</style>
