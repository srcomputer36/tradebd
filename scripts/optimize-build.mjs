import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const htmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Inline external Vite stylesheet <link rel="stylesheet" crossorigin href="/assets/index-*.css">
  // to eliminate the 1,090ms render-blocking CSS network request on Mobile Slow 4G
  const cssLinkRegex = /<link\s+rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g;
  html = html.replace(cssLinkRegex, (fullMatch, href) => {
    const cssFilePath = path.join(distDir, href.replace(/^\//, ''));
    if (fs.existsSync(cssFilePath)) {
      const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
      return `<style id="inlined-bundle-css">${cssContent}</style>`;
    }
    return fullMatch;
  });

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✓ Inlined production CSS into dist/index.html (0 render-blocking CSS requests)');
}
