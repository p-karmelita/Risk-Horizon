/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the floating Next.js dev indicator ("N" button / "Compiling…" badge).
  // It only ever shows in `next dev`, never in production, but this removes it there too.
  devIndicators: false,
  typedRoutes: true
};

export default nextConfig;
