// The whole app is static content (no per-request/user-specific data), so it's
// prerendered wholesale for GitHub Pages, which can only serve static files.
export const prerender = true;

// GitHub Pages resolves "/publications/" to "publications/index.html" but has
// no rewrite for extension-less "/publications" — trailing slashes on every
// generated route keep direct navigation/refresh working, not just client-side routing.
export const trailingSlash = 'always';
