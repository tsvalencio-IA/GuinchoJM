const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
function assert(cond, msg){ if(!cond){ console.error('FAIL:', msg); process.exit(1); } }
assert(css.includes('JM V8'), 'CSS V8 não encontrado');
assert(css.includes('max-width: none !important'), 'content sem max-width não aplicado');
assert(css.includes('@media (max-width: 1500px)'), 'breakpoint operacional 1500px ausente');
assert(css.includes('grid-template-columns: repeat(auto-fit, minmax(112px, 1fr))'), 'ações dos cards não quebram em grid responsivo');
assert(app.includes('Editar chamado'), 'botão Editar chamado no dossiê ausente');
assert(app.includes('Cliente / seguradora'), 'seção Cliente/seguradora ausente');
assert(app.includes('Pagamento / cobrança'), 'seção pagamento/cobrança ausente');
console.log('responsive-v8.test.js OK');
