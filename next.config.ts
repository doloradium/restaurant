/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    env: {
        JWT_SECRET: process.env.JWT_SECRET,
        NEXT_PUBLIC_GEOSUGGEST_KEY: process.env.GEOSUGGEST_KEY, // Pre-define this to avoid type errors
    },
    // Expose environment variables to the browser
    publicRuntimeConfig: {
        // Will be available on both server and client
        GEOSUGGEST_KEY: process.env.GEOSUGGEST_KEY,
    },
    // Add this to make environment variables accessible on client-side
    serverRuntimeConfig: {},
    // Properly expose GEOSUGGEST_KEY to the client
    experimental: {
        // This will expose process.env.GEOSUGGEST_KEY as process.env.NEXT_PUBLIC_GEOSUGGEST_KEY
        urlImports: [],
    },
};

// Add this to make GEOSUGGEST_KEY available as NEXT_PUBLIC_GEOSUGGEST_KEY
if (process.env.GEOSUGGEST_KEY) {
    process.env.NEXT_PUBLIC_GEOSUGGEST_KEY = process.env.GEOSUGGEST_KEY;
}

module.exports = nextConfig;
