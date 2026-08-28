import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import App from './src/App.tsx';
import { builtProjects, publishedProjects } from './src/content/project-data.ts';

const siteUrl = 'https://caleb-oke-portfolio.vercel.app';

function sitemapXml(): string {
  const entries = [
    `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...publishedProjects(builtProjects).map((project) => {
      const lastModified = project.updatedAt ? `\n    <lastmod>${project.updatedAt.slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${siteUrl}/projects/${project.slug}</loc>${lastModified}\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function setMeta(html: string, selector: RegExp, replacement: string): string {
  return selector.test(html) ? html.replace(selector, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
}

function pageMetadata(html: string, path: string): string {
  if (path === '/') return html;
  const canonical = `${siteUrl}${path}`;
  const project = builtProjects.find((item) => `/projects/${item.slug}` === path);
  const title = project ? (project.seoTitle || `${project.title} | Caleb Oke`) : 'Portfolio publishing desk | Caleb Oke';
  const description = project ? (project.seoDescription || project.summary) : 'Private portfolio publishing access.';
  const image = project?.imageUrl
    ? (project.imageUrl.startsWith('http') ? project.imageUrl : `${siteUrl}${project.imageUrl}`)
    : `${siteUrl}/og.png`;
  const robots = project ? 'index, follow, max-image-preview:large' : 'noindex, nofollow, noarchive';

  let output = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  output = setMeta(output, /<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  output = setMeta(output, /<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" />`);
  output = setMeta(output, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
  output = setMeta(output, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  output = setMeta(output, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  output = setMeta(output, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  output = setMeta(output, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  output = setMeta(output, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  output = setMeta(output, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  output = setMeta(output, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);

  if (project) {
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description,
      url: canonical,
      image,
      author: { '@type': 'Person', name: 'Caleb Oke', url: siteUrl },
      keywords: project.tools.join(', '),
      dateModified: project.updatedAt || undefined,
    }).replaceAll('<', '\\u003c');
    output = output.replace('</head>', `    <script type="application/ld+json">${structuredData}</script>\n  </head>`);
  }
  return output;
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

      const renderPage = (path: string) => {
        if (path === '/admin') return pageMetadata(template, path);
        const appMarkup = renderToString(createElement(StrictMode, null, createElement(App, { initialPath: path, initialProjects: builtProjects })));
        return pageMetadata(template.replace('<div id="root"></div>', `<div id="root">${appMarkup}</div>`), path);
      };

      html.source = renderPage('/');
      for (const project of publishedProjects(builtProjects)) {
        this.emitFile({ type: 'asset', fileName: `projects/${project.slug}/index.html`, source: renderPage(`/projects/${project.slug}`) });
      }
      this.emitFile({ type: 'asset', fileName: 'admin/index.html', source: renderPage('/admin') });

      const sitemap = bundle['sitemap.xml'];
      if (sitemap?.type === 'asset') {
        sitemap.source = sitemapXml();
      }
    },
    async writeBundle(options) {
      const outputDirectory = typeof options.dir === 'string' ? options.dir : path.resolve('dist');
      await writeFile(path.resolve(outputDirectory, 'sitemap.xml'), sitemapXml(), 'utf8');
    },
  };
}

export default defineConfig({
  plugins: [react(), preparePageHtml()],
});
