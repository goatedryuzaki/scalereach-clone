/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
