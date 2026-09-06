/* global process */

import { vercelPreset } from "@vercel/react-router/vite";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

export default {
  ssr: !isCapacitorBuild,
  presets: isCapacitorBuild ? [] : [vercelPreset()],
};
