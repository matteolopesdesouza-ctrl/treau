import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const origin = 'https://treau-studio.matteolopesdesouza.chatgpt.site';
const rule = (await readFile(new URL('./public/_redirects', import.meta.url),'utf8')).trim();
assert.equal(rule, '/* ' + origin + '/:splat 302!', 'The temporary redirect must preserve every path.');
const html = await readFile(new URL('./public/index.html', import.meta.url),'utf8');
assert.ok(html.includes('http-equiv="refresh"'), 'The static fallback needs a redirect.');
assert.ok(html.includes('content="0;url=' + origin + '/"'), 'Fallback redirect must point to the same storefront.');
assert.ok(html.includes('href="' + origin + '/"'), 'A visible link must remain available.');
assert.ok(html.includes('<html lang="fr">'), 'Fallback page language is French.');
console.log('TREAU: temporary Netlify routing and fallback verified.');
