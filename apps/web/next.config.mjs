const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Front-end only MVP: fully static site, no server (ADR #9).
  output: "export",
  // Set to "/feriadex" for the GitHub Pages project page; empty locally / on a
  // custom domain. Comes from the deploy workflow env.
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  reactStrictMode: true,
  // Workspace packages ship TypeScript source; let Next transpile them.
  transpilePackages: [
    "@feriadex/core",
    "@feriadex/holidays",
    "@feriadex/policies",
    "@feriadex/i18n",
  ],
};

export default nextConfig;
