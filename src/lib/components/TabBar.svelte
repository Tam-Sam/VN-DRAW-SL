<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const tabs = [
		{ href: resolve('/home'), label: 'Home', icon: '🏠' },
		{ href: resolve('/'), label: 'Map', icon: '🗺' },
		{ href: resolve('/publications'), label: 'Publications', icon: '📄' },
		{ href: resolve('/contact'), label: 'Contact', icon: '✉' }
	];
</script>

<nav class="tab-bar">
	{#each tabs as tab (tab.href)}
		<a href={tab.href} class="tab" class:active={page.url.pathname === tab.href}>
			<span class="tab-icon">{tab.icon}</span>
			<span>{tab.label}</span>
		</a>
	{/each}
</nav>

<style>
	.tab-bar {
		display: flex;
		background: var(--header-bg);
		flex-shrink: 0;
	}

	.tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.6rem;
		color: var(--header-ink-muted);
		text-decoration: none;
		font-size: 0.85rem;
		border-top: 2px solid transparent;
	}

	.tab-icon {
		font-size: 0.95rem;
	}

	.tab.active {
		color: white;
		border-top-color: var(--accent);
		background: rgba(255, 255, 255, 0.06);
	}
</style>
