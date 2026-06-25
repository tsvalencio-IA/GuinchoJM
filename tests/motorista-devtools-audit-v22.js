/*
JM Guinchos — Auditoria V22 do motorista
Uso no navegador (F12 > Console):
1) Abra motorista.html logado.
2) Cole o conteúdo deste arquivo no Console.
3) Rode: JMDriverAuditV22.run()

Objetivo: validar visual, navegação, pendências, alternância de tema,
botões críticos e ganchos de prova do motorista sem disparar ações destrutivas.
*/
(function(){
  'use strict';

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $$(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

  function parseColor(input){
    if (!input) return null;
    const s = String(input).trim();
    const rgb = s.match(/rgba?\(([^)]+)\)/i);
    if (rgb) {
      const parts = rgb[1].split(',').map(v => Number(String(v).trim()));
      return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0 };
    }
    const hex = s.replace('#','');
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      return { r: parseInt(hex[0]+hex[0],16), g: parseInt(hex[1]+hex[1],16), b: parseInt(hex[2]+hex[2],16) };
    }
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
    }
    return null;
  }

  function luminance(rgb){
    if (!rgb) return 0;
    const arr = [rgb.r, rgb.g, rgb.b].map(v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return arr[0]*0.2126 + arr[1]*0.7152 + arr[2]*0.0722;
  }

  function contrastRatio(fg, bg){
    const l1 = luminance(parseColor(fg));
    const l2 = luminance(parseColor(bg));
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
  }

  function result(name, ok, detail){ return { name, ok: !!ok, detail: detail || '' }; }
  function exists(sel, label){ return result(label || sel, !!$(sel), !!$(sel) ? 'ok' : 'ausente'); }

  function checkTheme(){
    const out = [];
    const btn = $('.theme-toggle');
    out.push(result('theme-toggle existe', !!btn, btn ? 'ok' : 'ausente'));
    if (!btn) return out;
    const before = document.documentElement.getAttribute('data-theme') || 'dark';
    const iconBefore = $('.theme-toggle-icon', btn)?.textContent || '';
    btn.click();
    const after = document.documentElement.getAttribute('data-theme') || 'dark';
    const iconAfter = $('.theme-toggle-icon', btn)?.textContent || '';
    out.push(result('theme alterna', before !== after, `${before} -> ${after}`));
    out.push(result('ícone alterna', iconBefore !== iconAfter, `${iconBefore} -> ${iconAfter}`));

    const samples = [
      ['body', document.body],
      ['topbar', $('.driver-topbar')],
      ['nav ativo', $('.driver-field-nav button.active')],
      ['card principal', $('#driverSimpleShell .driver-popular-card')],
      ['botão principal', $('#driverStreetPrimaryBtn')]
    ].filter(([, el]) => !!el);
    samples.forEach(([label, el]) => {
      const cs = getComputedStyle(el);
      const ratio = contrastRatio(cs.color, cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.body).backgroundColor : cs.backgroundColor);
      out.push(result(`contraste ${label}`, ratio >= 4.5, `ratio=${ratio}`));
    });

    btn.click();
    return out;
  }

  function checkPendencias(){
    const out = [];
    const jm = window.JM && window.JM.motorista;
    out.push(result('API motorista existe', !!jm, jm ? 'ok' : 'window.JM.motorista ausente'));
    if (!jm) return out;
    out.push(result('proofMissingItems existe', typeof jm.proofMissingItems === 'function', typeof jm.proofMissingItems));
    out.push(result('focusProofTarget existe', typeof jm.focusProofTarget === 'function', typeof jm.focusProofTarget));
    out.push(result('setProofWizardStep existe', typeof jm.setProofWizardStep === 'function', typeof jm.setProofWizardStep));

    const call = jm.state && jm.state.selectedCallId && jm.state.calls && jm.state.calls[jm.state.selectedCallId] || null;
    const missingBtn = $('#driverStreetMissingBtn');
    out.push(result('botão faltam X existe', !!missingBtn, missingBtn ? missingBtn.textContent.trim() : 'sem pendências ou botão ausente'));

    if (missingBtn) {
      missingBtn.click();
      const list = $('#driverPopularMissingList');
      out.push(result('lista de pendências abre', !!list, list ? 'ok' : 'não abriu'));
      const first = list && $('[data-missing-index]', list);
      out.push(result('item de pendência clicável', !!first, first ? first.textContent.trim() : 'nenhum item'));
      if (first && typeof jm.focusProofTarget === 'function') {
        const hits = [];
        const orig = jm.focusProofTarget;
        jm.focusProofTarget = function(target, step){ hits.push({target, step}); return orig.apply(this, arguments); };
        try { first.click(); } catch (e) {}
        jm.focusProofTarget = orig;
        out.push(result('clique em pendência chama focusProofTarget', hits.length > 0, JSON.stringify(hits[0] || {})));
      }
    }

    if (call && typeof jm.proofMissingItems === 'function') {
      let items = [];
      try { items = jm.proofMissingItems(call) || []; } catch (e) { items = []; }
      out.push(result('pendências calculadas', Array.isArray(items), `qtd=${items.length}`));
      items.forEach((item, idx) => {
        out.push(result(`pendência #${idx+1} mapeada`, !!(item.target || item.step), `${item.group || 'Geral'} | ${item.label || ''} | target=${item.target || ''} | step=${item.step || ''}`));
      });
    }
    return out;
  }

  function checkButtonsAndLinks(){
    const out = [];
    const checks = [
      ['#driverRefreshBtn', 'Atualizar'],
      ['#driverLogoutBtn', 'Sair'],
      ['#driverActiveRouteBtn', 'Abrir rota interna'],
      ['#driverActiveStartRouteBtn', 'Iniciar deslocamento'],
      ['#driverApplyStatusBtn', 'Atualizar status'],
      ['#driverClearActiveCallBtn', 'Trocar atendimento'],
      ['#driverExpenseSubmitBtn', 'Enviar despesa'],
      ['#driverSaveProofDraftBtn', 'Salvar provas'],
      ['#driverProofNextBtn', 'Continuar provas'],
      ['#driverProofPrevBtn', 'Voltar provas'],
      ['#driverSubmitProofBtn', 'Enviar provas'],
      ['#toggleSignatureModeBtn', 'Ativar assinatura'],
      ['#clearSignatureBtn', 'Limpar assinatura']
    ];
    checks.forEach(([sel, label]) => out.push(exists(sel, label)));

    const navButtons = $$('.driver-field-nav button');
    out.push(result('nav inferior tem botões', navButtons.length >= 3, `qtd=${navButtons.length}`));
    navButtons.forEach((btn, idx) => {
      out.push(result(`nav botão ${idx+1}`, !!btn.dataset.driverTarget, `${btn.textContent.trim()} -> ${btn.dataset.driverTarget || ''}`));
    });

    const fileInputs = $$('input[type="file"]');
    out.push(result('inputs de arquivo encontrados', fileInputs.length >= 6, `qtd=${fileInputs.length}`));
    fileInputs.forEach((el, idx) => {
      out.push(result(`input arquivo #${idx+1}`, !!el.id, `${el.id || 'sem-id'} | accept=${el.accept || ''}`));
    });
    return out;
  }

  function checkThemeButtonPosition(){
    const out = [];
    const btn = $('.theme-toggle');
    const nav = $('.driver-field-nav');
    if (!btn || !nav) return [result('theme-toggle posição', !!btn, !btn ? 'botão ausente' : 'nav ausente')];
    const b = btn.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    const overlap = !(b.right < n.left || b.left > n.right || b.bottom < n.top || b.top > n.bottom);
    out.push(result('theme-toggle não sobrepõe navegação', !overlap, `btn=${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.right)},${Math.round(b.bottom)} nav=${Math.round(n.left)},${Math.round(n.top)},${Math.round(n.right)},${Math.round(n.bottom)}`));
    return out;
  }

  function run(){
    const suites = [
      ...checkButtonsAndLinks(),
      ...checkPendencias(),
      ...checkTheme(),
      ...checkThemeButtonPosition()
    ];
    const ok = suites.filter(x => x.ok).length;
    const fail = suites.length - ok;
    console.group('JMDriverAuditV22');
    console.table(suites);
    console.info(`Resumo: ${ok} ok / ${fail} falhas`);
    if (fail) {
      console.warn('Falhas detectadas:', suites.filter(x => !x.ok));
    }
    console.groupEnd();
    return { ok, fail, suites };
  }

  window.JMDriverAuditV22 = { run };
  console.log('JMDriverAuditV22 carregado. Rode: JMDriverAuditV22.run()');
})();
