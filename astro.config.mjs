import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  //output: "server",
  integrations: [svelte(), tailwind()],
  adapter: node({
    mode: 'standalone'
  }),
  //adapter: vercel({
  //  webAnalytics: {
  //    enabled: true,
  //  },
  //  maxDuration: 100,
  //}),
  server: {
    host: "0.0.0.0"
  }
});
