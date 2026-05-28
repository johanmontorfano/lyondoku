import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            new URL("https://storage.ko-fi.com/cdn/**")
        ]
    },
    allowedDevOrigins: ["192.168.1.55", "192.168.1.27"]
};

export default nextConfig;
