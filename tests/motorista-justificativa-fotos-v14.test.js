const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const motorista = fs.readFileSync(path.join(root, 'js', 'motorista.js'), 'utf8');
const simple = fs.readFileSync(path.join(root, 'js', 'motorista-simple-flow.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'motorista.html'), 'utf8');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(html.includes('id="proofPhotoJustification"'), 'motorista.html precisa ter justificativa única de fotos');
assert(motorista.includes('photoJustification'), 'motorista.js precisa salvar proofChecklist.photoJustification');
assert(motorista.includes('proofPhotoJustificationText'), 'motorista.js precisa centralizar leitura da justificativa');
assert(motorista.includes('groupMissingPhotos'), 'motorista.js precisa agrupar fotos faltantes');
assert(motorista.includes('Envie as fotos ou escreva uma única justificativa para todas'), 'validação precisa orientar justificativa única');
assert(simple.includes('JUSTIFICAR FOTOS UMA VEZ'), 'fluxo simples precisa ter botão de justificativa única');
assert(simple.includes('justifyAllPhotos'), 'fluxo simples precisa aplicar justificativa única');
assert(simple.includes('Não bati fotos.'), 'fluxo simples precisa sugerir justificativa curta para motorista');
console.log('motorista-justificativa-fotos-v14.test.js OK');
