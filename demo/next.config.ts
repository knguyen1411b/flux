import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
    experimental: {
        outputFileTracingRoot: path.join(__dirname, "..")
    }
};

export default nextConfig;
