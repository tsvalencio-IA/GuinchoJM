const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('motorista.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const utils = fs.readFileSync('js/utils.js', 'utf8');
const simple = fs.readFileSync('js/motorista-simple-flow.js', 'utf8');
const audit = fs.readFileSync('tests/motorista-devtools-audit-v22.js', 'utf8');
const entrega = fs.readFileSync('ENTREGA_FLUXO_OPERACIONAL_V22.md', 'utf8');

assert(html.includes('jm-fluxo-operacional-v26-cache-refresh'), 'motorista.html precisa manter a versão ativa unificada');
assert(simple.includes('V22') || entrega.includes('V22'), 'sinalização documental da V22 ausente');
assert(utils.includes('theme-toggle-icon'), 'theme toggle discreto com ícone ausente');
assert(utils.includes('Ativar modo escuro') && utils.includes('Ativar modo claro'), 'theme toggle precisa alternar rótulo corretamente');
assert(css.includes('top: calc(env(safe-area-inset-top, 0px) + 12px)') || css.includes('top: calc(env(safe-area-inset-top, 0px) + 10px)'), 'theme toggle não foi movido para o topo discreto');
assert(css.includes('body.driver-popular-mode .theme-toggle') || css.includes('body.driver-street-mode .theme-toggle'), 'CSS específico do motorista para theme toggle ausente');
assert(simple.includes('resolveMissingTarget'), 'mapeamento robusto de pendências ausente');
assert(simple.includes('goToMissing(missing)'), 'ABRIR precisa reaproveitar navegação direta das pendências');
assert(audit.includes('JMDriverAuditV22') && audit.includes('focusProofTarget') && audit.includes('theme-toggle'), 'script de auditoria V22 incompleto');
assert(entrega.includes('Botão modo claro/escuro redesenhado'), 'documentação V22 incompleta');

console.log('motorista-v22-theme-pendencias ok');
