/** @type {import('next').NextConfig} */
const nextConfig = {
  // Front-end only MVP: fully static site, no server (ADR #9).
  output: "export",
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
