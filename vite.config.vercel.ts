import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import App from './src/App.tsx';
import { allProjects } from './src/content/projects/index.ts';
import { generateImagesPlugin } from './scripts/generate-images.ts';

const siteUrl = 'https://www.caleboke.com';
const NL = String.fromCharCode(10);

function robotsTxt(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join(NL);
}

function sitemapXml(): string {
  const entry = (loc: string, priority: string) => [
    '  <url>',
    `    <loc>${loc}</loc>`,
    '    <changefreq>monthly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join(NL);

  const entries = [
    entry(`${siteUrl}/`, '1.0'),
    ...allProjects.map((project) => entry(`${siteUrl}/projects/${project.slug}`, '0.8')),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join(NL);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function setMeta(html: string, selector: RegExp, replacement: string): string {
  return selector.test(html)
    ? html.replace(selector, replacement)
    : html.replace('</head>', `    ${replacement}${NL}  </head>`);
}

function pageMetadata(html: string, pagePath: string): string {
  /* The template names no host. Every URL in index.html - canonical, og:url,
     og:image, twitter:image and all five JSON-LD fields - is written as
     {{SITE_URL}} and resolved here, so siteUrl is the only place the host
     exists and changing it moves every URL on every page.

     There used to be an `if (pagePath === '/') return html` above this. It was
     redundant: the project lookup below already returns the template
     unchanged for any path that is not a project route, the homepage
     included. What it actually did was skip this substitution for the
     homepage, which is why the homepage kept the apex host while the project
     pages moved to www. */
  let output = html.replaceAll('{{SITE_URL}}', siteUrl);

  const canonical = `${siteUrl}${pagePath}`;
  const project = allProjects.find((item) => `/projects/${item.slug}` === pagePath);

  /* Not a project route. The homepage lands here and keeps its own
     hand-written title and description, now with the host resolved. */
  if (!project) return output;

  const title = project.seoTitle || `${project.title} | Caleb Oke`;
  const description = project.seoDescription || project.opening;
  const image = `${siteUrl}/og.png`;

  output = output.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  output = setMeta(output, /<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  output = setMeta(output, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
  output = setMeta(output, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  output = setMeta(output, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  output = setMeta(output, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  output = setMeta(output, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  output = setMeta(output, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  output = setMeta(output, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  output = setMeta(output, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description,
    url: canonical,
    image,
    author: { '@type': 'Person', name: 'Caleb Oke', url: siteUrl },
    keywords: project.tools.join(', '),
  }).replaceAll('<', String.fromCharCode(92) + 'u003c');

  return output.replace('</head>', `    <script type="application/ld+json">${structuredData}</script>${NL}  </head>`);
}

function preparePageHtml(): Plugin {
  return {
    name: 'inline-page-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html'];
      if (!html || html.type !== 'asset' || typeof html.source !== 'string') return;

      let template = html.source;
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !fileName.endsWith('.css')) continue;
        const css = typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source);
        const stylesheet = `<link rel="stylesheet" crossorigin href="/${fileName}">`;
        if (template.includes(stylesheet)) {
          template = template.replace(stylesheet, `<style>${css}</style>`);
          delete bundle[fileName];
        }
      }

      const renderPage = (pagePath: string) => {
        const appMarkup = renderToString(
          createElement(StrictMode, null, createElement(App, { initialPath: pagePath })),
        );
        return pageMetadata(template.replace('<div id="root"></div>', `<div id="root">${appMarkup}</div>`), pagePath);
      };

      html.source = renderPage('/');
      for (const project of allProjects) {
        this.emitFile({
          type: 'asset',
          fileName: `projects/${project.slug}/index.html`,
          source: renderPage(`/projects/${project.slug}`),
        });
      }

      const sitemap = bundle['sitemap.xml'];
      if (sitemap?.type === 'asset') {
        sitemap.source = sitemapXml();
      }
    },
    async writeBundle(options) {
      const outputDirectory = typeof options.dir === 'string' ? options.dir : path.resolve('dist');
      await writeFile(path.resolve(outputDirectory, 'sitemap.xml'), sitemapXml(), 'utf8');
      await writeFile(path.resolve(outputDirectory, 'robots.txt'), robotsTxt(), 'utf8');
    },
  };
}

export default defineConfig({
  plugins: [generateImagesPlugin(), react(), preparePageHtml()],
});
