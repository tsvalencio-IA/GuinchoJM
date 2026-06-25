const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const jm = fs.readFileSync(path.join(root, 'jm.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const version = fs.readFileSync(path.join(root, 'version.json'), 'utf8');
const VERSION = 'jm-fluxo-operacional-v26-cache-refresh';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(jm.includes(`app.js?v=${VERSION}`), 'jm.html não carrega app.js com a versão do hotfix');
assert(jm.includes(`final-ux.js?v=${VERSION}`), 'jm.html não carrega final-ux.js com a versão do hotfix');
assert(sw.includes(`CACHE_NAME = "${VERSION}"`), 'service-worker.js não usa o cache do hotfix');
assert(version.includes(`"version": "${VERSION}"`), 'version.json não usa o hotfix');
assert(app.includes(`LOGIN_FLOW_VERSION = "${VERSION}"`), 'app.js não informa versão do hotfix');
assert(!app.includes('calculateCurrentRoutePricing({ syncTowForm: true, autoFill: true })'), 'a rota inteligente ainda chama autoFill true');
assert(!app.includes('setOfficialPriceField(result.pricingSuggestion.suggestedServiceValue'), 'calculateCurrentRoutePricing ainda aplica valor oficial automaticamente');
assert(app.includes('function applySuggestedPriceToForm()'), 'botão de aplicar sugestão perdeu a função');
assert(app.includes('setOfficialPriceField(suggestion.suggestedServiceValue, "suggested")'), 'aplicação explícita da sugestão foi perdida');
assert(jm.includes('id="btnUseSuggestedPrice"'), 'botão Usar preço sugerido não existe no HTML');
assert(jm.includes('class="legacy-tow-fields hidden"'), 'campos legados de guincho não foram preservados de forma oculta');
assert(!jm.includes('<b>Precificação do guincho</b>'), 'card confuso de precificação do guincho continua visível');
assert(!jm.includes('Saída guincho (R$)'), 'campo Saída guincho continua visível');
assert(jm.includes('Fechamento manual do chamado'), 'novo fechamento manual não foi encontrado');
console.log('OK financeiro-rota-manual-hotfix');
