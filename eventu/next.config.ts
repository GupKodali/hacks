import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    APP_BASE_URL: process.env.APP_BASE_URL,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID:
        process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
},
};

export default nextConfig;
