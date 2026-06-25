const fs = require('fs');
const assert = require('assert');

const version = 'jm-fluxo-operacional-v26-cache-refresh';
const js = fs.readFileSync('js/motorista-simple-flow.js', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const html = fs.readFileSync('motorista.html', 'utf8');

assert(js.includes(version), 'motorista-simple-flow sem versão V21');
assert(html.includes(version), 'motorista.html não carrega V21');
assert(js.includes('renderMissingList'), 'V21 precisa renderizar lista de pendências');
assert(js.includes('data-missing-index'), 'pendências precisam ser clicáveis por índice');
assert(js.includes('goToMissing'), 'pendência precisa chamar navegação direta');
assert(js.includes('ROTA / GPS'), 'atalho ROTA / GPS ausente');
assert(js.includes('FOTOS / PROVAS'), 'atalho FOTOS / PROVAS ausente');
assert(js.includes('DETALHES'), 'atalho DETALHES ausente');
assert(css.includes('driver-popular-missing-list'), 'CSS da lista de pendências ausente');
assert(css.includes('driver-popular-shortcuts'), 'CSS dos atalhos rápidos ausente');

console.log('motorista-pendencias-v21 ok');
