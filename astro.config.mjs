import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://cp3.io",
  // Keep Astro 2 scoping: component styles must not outrank Tailwind utilities.
  scopedStyleStrategy: "where",
  integrations: [react(), sitemap()],
  // The notes used to be blog posts under /posts.
  redirects: {
    "/posts": "/notes",
    "/posts/1": "/notes",
    "/posts/rust-on-ios": "/notes/rust-on-ios",
    "/posts/sample-accurate-midi-timing": "/notes/sample-accurate-midi-timing",
  },
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
