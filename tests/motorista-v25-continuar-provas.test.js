const fs = require('fs');
const assert = require('assert');
const js = fs.readFileSync('js/motorista-simple-flow.js', 'utf8');
assert(js.includes('V25: o botão CONTINUAR precisa sempre responder'), 'comentário V25 do continuar ausente');
assert(js.includes('event.stopImmediatePropagation()'), 'V25 precisa assumir clique do CONTINUAR antes do handler antigo');
assert(js.includes('api().saveProofDraft({ silent: true, validate: false })'), 'CONTINUAR precisa chamar saveProofDraft pela API pública');
assert(js.includes('api().setProofWizardStep(Math.min(5, currentIndex + 1)'), 'CONTINUAR precisa avançar etapa pela API pública');
console.log('motorista-v25-continuar-provas ok');
