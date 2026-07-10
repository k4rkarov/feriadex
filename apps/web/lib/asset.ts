/**
 * Base path prefix for static assets (empty locally / on a custom domain,
 * "/feriadex" on the GitHub Pages project page). Next.js applies basePath to
 * routes and next/link, but NOT to raw string asset paths (CSS url(), <img>,
 * metadata icons), so those must go through this helper.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string): string => `${BASE_PATH}${path}`;
