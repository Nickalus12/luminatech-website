// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import rehypePrettyCode from 'rehype-pretty-code';

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: 'github-dark-dimmed',
  keepBackground: true,
};

// https://astro.build/config
export default defineConfig({
  site: 'https://lumina-erp.com',
  prefetch: true,
  integrations: [
    react(),
    mdx(),
    sitemap(),
    compress(),
  ],
  markdown: {
    rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
    syntaxHighlight: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
