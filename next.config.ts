import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Three.js / R3F to work in the browser bundle
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/rapier"],

  // Webpack tweaks for WASM (Rapier physics engine)
  webpack: (config, { isServer }) => {
    // Rapier uses WASM
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Exclude server-side from Three.js bundling
    if (isServer) {
      config.externals = [...(config.externals || []), "three"];
    }

    return config;
  },
};

export default nextConfig;
