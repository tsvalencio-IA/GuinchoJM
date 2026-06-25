const fs = require('fs');
const assert = require('assert');
const js = fs.readFileSync('js/motorista-simple-flow.js','utf8');

assert(js.includes('JM motorista V24'), 'marcador V24 ausente');
assert(js.includes('function openAllDetails'), 'openAllDetails ausente');
assert(js.includes('not([data-driver-finalized]):not([data-street-all])'), 'handler genérico ainda pode capturar Finalizados/Detalhes');
assert(js.includes('event.stopPropagation()'), 'Finalizados/Detalhes precisam parar propagação duplicada');
assert(js.includes('installProofWizardSafety'), 'proteção extra do wizard de provas ausente');
assert(js.includes('dataset.streetSafetyBound'), 'proteção contra múltiplos binds ausente');
assert(js.includes('goToMissing(missing[0])'), 'Continuar provas deve apontar para pendência quando bloquear');
console.log('motorista-v24-acoes-finalizados ok');
