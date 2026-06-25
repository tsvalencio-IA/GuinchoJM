const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const motorista = fs.readFileSync(path.join(root, 'js', 'motorista.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'motorista.html'), 'utf8');
const version = 'jm-fluxo-operacional-v26-cache-refresh';
function assert(cond, msg){ if(!cond){ throw new Error(msg); } }
assert(html.includes(version), 'motorista.html deve carregar V11');
assert(motorista.includes('setupDriverImagePickers'), 'setupDriverImagePickers ausente');
assert(motorista.includes('Tirar foto agora'), 'botão Tirar foto agora ausente');
assert(motorista.includes('Escolher da galeria'), 'botão Escolher da galeria ausente');
assert(motorista.includes('copyFilesToInput'), 'ponte galeria -> input original ausente');
assert(motorista.includes('Salvar no celular'), 'link Salvar no celular ausente');
assert(css.includes('driver-image-picker-wrap'), 'CSS dos controles de foto ausente');
console.log('motorista-fotos-camera-galeria-v11.test.js OK');
