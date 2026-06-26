const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const version = 'jm-fluxo-operacional-v29-motorista-cache-clean';
const oldRe = /jm-fluxo-operacional-v2[1-8]/;
function read(p){ return fs.readFileSync(path.join(root,p),'utf8'); }
for (const f of ['motorista.html','service-worker.js','version.json','js/motorista.js','js/motorista-simple-flow.js','js/motorista-final-ux.js','css/style.css']) {
  const txt = read(f);
  if (oldRe.test(txt)) throw new Error(`${f} contém versão antiga`);
}
for (const f of ['motorista.html','service-worker.js','version.json','js/motorista.js','js/motorista-simple-flow.js','js/motorista-final-ux.js']) {
  const txt = read(f);
  if (!txt.includes(version)) throw new Error(`${f} não contém V29`);
}
const sw = read('service-worker.js');
['purgeOldVersionEntries','shouldCacheRequest','PURGE_OLD_CACHES','OLD_VERSION_RE'].forEach(token => {
  if (!sw.includes(token)) throw new Error(`service-worker sem ${token}`);
});
console.log('motorista-v29-cache-clean ok');
