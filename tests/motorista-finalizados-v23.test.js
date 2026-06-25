const fs = require('fs');
const assert = require('assert');

const motorista = fs.readFileSync('js/motorista.js', 'utf8');
const simple = fs.readFileSync('js/motorista-simple-flow.js', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');

assert(motorista.includes('callsView'), 'estado callsView ausente');
assert(motorista.includes('finalizedCalls'), 'função finalizedCalls ausente');
assert(motorista.includes('setCallsView'), 'função setCallsView ausente');
assert(motorista.includes('Finalizados <b>'), 'botão/aba Finalizados não foi renderizado');
assert(motorista.includes('Ver finalizado'), 'ação Ver finalizado ausente');
assert(motorista.includes('Atendimento finalizado. Consulta liberada'), 'modo somente consulta para finalizado ausente');
assert(simple.includes('data-driver-finalized'), 'menu MAIS sem acesso a Finalizados');
assert(simple.includes('driver-signature-only'), 'controle de classe signature-only ausente');
assert(css.includes('driver-call-view-toggle'), 'CSS do filtro Ativos/Finalizados ausente');
assert(css.includes('driver-popular-primary { background-color'), 'cor de fundo real do botão principal ausente');

console.log('motorista-finalizados-v23 ok');
