<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	// routeId matches SvelteKit's `page.route.id` — the route's definition path,
	// unaffected by trailingSlash/base-path config (unlike page.url.pathname,
	// which is "/home/" once trailingSlash is 'always', never equal to a bare href).
	const tabs = [
		{ routeId: '/home', href: resolve('/home'), label: 'Home', icon: '🏠' },
		{ routeId: '/', href: resolve('/'), label: 'Map', icon: '🗺' },
		{ routeId: '/publications', href: resolve('/publications'), label: 'Publications', icon: '📄' },
		{ routeId: '/contact', href: resolve('/contact'), label: 'Contact', icon: '✉' }
	];
</script>

<nav class="tab-bar">
	{#each tabs as tab (tab.href)}
		<a href={tab.href} class="tab" class:active={page.route.id === tab.routeId}>
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
