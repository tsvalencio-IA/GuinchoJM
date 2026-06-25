
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const jm = fs.readFileSync(path.join(root, 'jm.html'), 'utf8');
function assert(cond,msg){ if(!cond){ console.error('FAIL:',msg); process.exit(1);} }
assert(jm.includes('jm-fluxo-operacional-v26-cache-refresh'), 'jm.html deve carregar versão V10');
assert(css.includes('JM V10'), 'CSS V10 ausente');
assert(css.includes('#view-chamados > .grid'), 'layout específico da aba chamados ausente');
assert(css.includes('grid-template-columns:1fr'), 'breakpoint de empilhamento ausente');
assert(css.includes('.call-card.is-collapsed .call-card-body { display:block !important; }'), 'card minimizado deve preservar detalhes essenciais');
assert(css.includes('overflow-wrap:anywhere'), 'quebra de texto responsiva ausente');
assert(app.includes('Editar chamado'), 'ação Editar chamado deve permanecer no app');
assert(app.includes('call-card-grid'), 'grade de detalhes do chamado deve permanecer no card');
console.log('responsive-v10.test.js OK');
