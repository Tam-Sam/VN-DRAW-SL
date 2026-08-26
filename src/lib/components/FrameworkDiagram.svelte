<script lang="ts">
	const steps = [
		{
			label: 'Assess',
			labelColor: '#d9713c',
			panelColor: '#f6ddd0',
			text: 'Hazard + Exposure + Vulnerability → Drought Risk Index (DRI)',
			note: 'With locally tailored indicators'
		},
		{
			label: 'Visualise',
			labelColor: '#2e6b3e',
			panelColor: '#d4d9cb',
			text: 'Interactive maps showing where drought risk is highest and how it varies across administrative units (With queries).'
		},
		{
			label: 'Prioritise',
			labelColor: '#1e9bc7',
			panelColor: '#d0e2f0',
			text: 'Identify high-risk areas to support government drought-management planning and resource allocation.'
		},
		{
			label: 'Adapt',
			labelColor: '#9c2e96',
			panelColor: '#e2d4e5',
			text: 'Link identified risk and its drivers with targeted drought adaptation strategies.'
		},
		{
			label: 'Evidence',
			labelColor: '#5fa82e',
			panelColor: '#d8e4cd',
			text: 'Spatial and temporal evidence of agricultural drought risk across mainland Vietnam (2015–2022).',
			note: 'Risk patterns assessed against historical drought-related agricultural losses'
		},
		{
			label: 'Share & Improve',
			labelColor: '#d9713c',
			panelColor: '#f6ddd0',
			text: 'Open access to data and research findings, enabling stakeholder engagement, knowledge exchange, and continuous improvement'
		}
	];
</script>

<div class="framework">
	{#each steps as step (step.label)}
		<div class="row">
			<div class="label" style:background={step.labelColor}>{step.label}</div>
			<div class="panel" style:background={step.panelColor}>
				<p>{step.text}</p>
				{#if step.note}
					<p class="note">&#123;{step.note}&#125;</p>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.framework {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow);
	}

	.row {
		display: flex;
		min-height: 100px;
	}

	.label {
		flex: 0 0 22%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: white;
		font-weight: 700;
		font-size: 1.4rem;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		padding: 0.75rem;
	}

	.panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.3rem;
		padding: 1rem 1.5rem;
		color: var(--ink);
	}

	.panel p {
		margin: 0;
		line-height: 1.4;
	}

	.panel .note {
		font-style: italic;
		color: var(--ink-secondary);
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		.row {
			flex-direction: column;
			min-height: 0;
		}

		.label {
			flex-basis: auto;
		}
	}
</style>
