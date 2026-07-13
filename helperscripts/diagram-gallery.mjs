#!/usr/bin/env node
// Renders every lesson diagram from js/onramp-diagrams.js into one HTML page
// so they can all be eyeballed side by side on the real page background.
//
// Run from the repo root:  node helperscripts/diagram-gallery.mjs
// then open /tmp/74sim-diagram-gallery.html in a browser.

import { writeFileSync } from 'fs';

const D = await import('../js/onramp-diagrams.js');
const cells = Object.entries(D)
  .filter(([k]) => k.startsWith('SVG_'))
  .map(([k, v]) => `<div class="cell"><h4>${k}</h4>${v}</div>`)
  .join('\n');

const html = `<!doctype html><meta charset="utf-8"><title>74Sim diagram gallery</title>
<style>
  body { background: #0d0d0d; font-family: Arial; margin: 12px }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, 340px); gap: 14px }
  .cell h4 { color: #777; font-size: 11px; margin: 2px 0 }
  .lesson-diagram { display: block; width: 100%; background: #161616;
                    border: 1px solid #252525; border-radius: 4px }
</style>
<div class="grid">
${cells}
</div>`;

const out = '/tmp/74sim-diagram-gallery.html';
writeFileSync(out, html);
console.log(`wrote ${out} (${Object.keys(D).filter(k => k.startsWith('SVG_')).length} diagrams)`);
