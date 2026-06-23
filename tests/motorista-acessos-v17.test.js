const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const simple = fs.readFileSync(path.join(root, 'js', 'motorista-simple-flow.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
function assert(cond, msg){ if(!cond){ console.error('FAIL:', msg); process.exit(1); } }
assert(simple.includes('driver-street-dock'), 'dock de acessos rápidos ausente no modo rua');
['Chamados','Mapa','GPS','Provas','Despesa','Etapas'].forEach(label => assert(simple.includes(label), 'atalho ausente: '+label));
assert(simple.includes('openDriverModule'), 'função openDriverModule ausente');
assert(simple.includes('returnToStreetMode'), 'função returnToStreetMode ausente');
assert(simple.includes('driver-focus-technical'), 'modo técnico focado não acionado');
assert(css.includes('.driver-street-dock'), 'CSS do dock ausente');
assert(css.includes('driver-show-all'), 'CSS de ver tudo ausente');
console.log('motorista-acessos-v17 OK');
