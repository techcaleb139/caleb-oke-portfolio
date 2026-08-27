import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import App from './src/App.tsx';

function preparePageHtml(): Plugin {
  return {
    name: 'inline-page-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html'];
      if (!html || html.type !== 'asset' || typeof html.source !== 'string') return;

      let source = html.source;
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !fileName.endsWith('.css')) continue;
        const css = typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source);
        const stylesheet = `<link rel="stylesheet" crossorigin href="/${fileName}">`;
        source = source.replace(stylesheet, `<style>${css}</style>`);
        delete bundle[fileName];
      }
      const appMarkup = renderToString(createElement(StrictMode, null, createElement(App)));
      source = source.replace('<div id="root"></div>', `<div id="root">${appMarkup}</div>`);
      html.source = source;
    },
  };
}

export default defineConfig({
  plugins: [react(), preparePageHtml()],
});
