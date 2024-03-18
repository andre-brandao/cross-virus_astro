import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import vercel from '@astrojs/vercel/serverless';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output:'server',
  integrations: [svelte(), tailwind()],
  adapters: [vercel()],
});