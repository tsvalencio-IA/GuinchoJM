const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('motorista.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const js = fs.readFileSync('js/motorista.js', 'utf8');
const simple = fs.readFileSync('js/motorista-simple-flow.js', 'utf8');
const version = 'jm-fluxo-operacional-v28-motorista-hotfix';

assert(html.includes(version), 'motorista.html não carrega V27');
assert(js.includes(version), 'motorista.js sem V27');
assert(simple.includes(version), 'motorista-simple-flow.js sem V27');
assert(css.includes('V27 — Motorista'), 'css sem bloco V27');

assert(html.includes('driverResetStageProofsBtn'), 'sem botão ZERAR ETAPA');
assert(html.includes('driverResetAllProofsBtn'), 'sem botão ZERAR PROVAS');
assert(html.includes('data-signature-refusal'), 'sem motivos rápidos de recusa');

assert(js.includes('function resetProofs(scope)'), 'sem função resetProofs');
assert(js.includes('hasSignatureRefusalEvidence'), 'sem lógica de recusa');
assert(js.includes('buildRefusalSignatureData'), 'sem payload de recusa');
assert(js.includes('resetProofs,'), 'resetProofs não exposto na API pública');
assert(js.includes('setupSignatureRefusalQuickButtons'), 'sem bind dos motivos de recusa');
assert(js.includes('setupResetProofButtons'), 'sem bind dos botões de reset');

assert(simple.includes('resetProofsFlow'), 'fluxo simples sem zerar provas');
assert(simple.includes('driverStreetResetProofsBtn'), 'card motorista sem botão zerar provas');
assert(simple.includes('Nome/documento não bloqueiam recusa'), 'assinatura recusada sem instrução correta');

assert(css.includes('html[data-theme="light"] body.driver-popular-mode'), 'sem override claro motorista');
assert(css.includes('body.driver-popular-mode .driver-popular-actions button'), 'sem override escuro motorista');

console.log('motorista-v28-hotfix ok');
