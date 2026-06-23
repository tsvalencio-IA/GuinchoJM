/* JM motorista V17 - Modo Rua com acessos preservados
   Uma ação por vez na tela principal, mas sem remover acesso a Chamados, Mapa/GPS, Provas, Despesas e Etapas anteriores. */
(function () {
  "use strict";

  const VERSION = "jm-fluxo-operacional-v17-motorista-modo-rua-com-acessos";
  const $ = (id) => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const STATUS_NEXT = {
    despachado: "motorista_a_caminho",
    motorista_a_caminho: "motorista_no_local",
    motorista_no_local: "veiculo_carregado",
    veiculo_carregado: "em_transporte",
    em_transporte: "entregue",
    entregue: "finalizado"
  };

  const STATUS_LABEL = {
    despachado: "Liberado",
    motorista_a_caminho: "Indo para a ocorrência",
    motorista_no_local: "Na ocorrência",
    veiculo_carregado: "Veículo carregado",
    em_transporte: "Em transporte",
    entregue: "No destino",
    finalizado: "Finalizado"
  };

  const PROOF_STEP_INDEX = {
    retirada: 0,
    inspecao: 1,
    carregamento: 2,
    transporte: 3,
    entrega: 4,
    finalizacao: 5
  };

  const PROOF_STEP_TITLES = {
    retirada: "Retirada",
    inspecao: "Inspeção",
    carregamento: "Carregamento",
    transporte: "Transporte",
    entrega: "Entrega",
    finalizacao: "Assinatura"
  };

  const SELECT_TO_STEP = {
    proofStageRetirada: "retirada",
    proofStageCarregamento: "carregamento",
    proofStageTransporte: "transporte",
    proofStageEntrega: "entrega",
    proofStageFinalizacao: "finalizacao"
  };

  const PANEL_BY_STEP = {
    atendimento: "driverPanelActive",
    chamados: "driverPanelCalls",
    rota: "driverPanelMap",
    gps: "driverPanelLocation",
    provas: "driverPanelProofs",
    despesas: "driverPanelExpense"
  };

  const PHOTO_INPUTS_BY_STEP = {
    retirada: ["proofPhotoFront", "proofPhotoRear", "proofPhotoRight", "proofPhotoLeft", "proofPhotoDashboard"],
    inspecao: ["proofPhotoFront", "proofPhotoRear", "proofPhotoRight", "proofPhotoLeft", "proofPhotoDashboard", "proofPhotoDamage"],
    carregamento: ["proofPhotoLoadAfter", "proofPhotoFront", "proofPhotoRear", "proofPhotoRight", "proofPhotoLeft", "proofPhotoDashboard"],
    transporte: ["proofPhotoLoadAfter"],
    entrega: ["proofPhotoDeliveryFront", "proofPhotoDeliveryRear", "proofPhotoDeliveryRight", "proofPhotoDeliveryLeft", "proofPhotoDeliveryDashboard", "proofPhotoFinal"],
    finalizacao: ["proofPhotoFinal"]
  };

  let renderTimer = null;
  let busy = false;
  let lastPhotoInputId = "";

  function api() {
    return window.JM && window.JM.motorista || {};
  }

  function state() {
    return api().state || {};
  }

  function currentCall() {
    const st = state();
    return st.selectedCallId && st.calls && st.calls[st.selectedCallId] || null;
  }

  function normalizeStatus(call) {
    return String(call && (call.statusKey || call.status) || "despachado")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function shortAddress(value, fallback) {
    const raw = String(value || fallback || "").replace(/\s+/g, " ").trim();
    return raw.length > 64 ? raw.slice(0, 61) + "..." : raw;
  }

  function routeTitle(call) {
    if (!call) return "Nenhum chamado selecionado";
    const origin = call.originAddress || call.origem || call.origin || call.pickupAddress || "Origem";
    const dest = call.destinationAddress || call.destino || call.destination || call.dropoffAddress || "Destino";
    return `${shortAddress(origin, "Origem")} → ${shortAddress(dest, "Destino")}`;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }

  function setVisiblePanel(panelId, options) {
    const app = $("driverAppView");
    if (!app) return;
    const target = panelId || PANEL_BY_STEP.atendimento;
    const opts = options || {};

    /* V17: abrir um módulo técnico não pode parecer função removida.
       O Modo Rua continua limpo, mas Chamados/Mapa/GPS/Provas/Despesas ficam acessíveis por atalhos. */
    if (target !== PANEL_BY_STEP.atendimento && opts.technical !== false) {
      document.body.classList.add("driver-focus-technical");
      document.body.classList.remove("driver-show-all");
    }

    app.dataset.simplePanel = target;
    qsa(".panel[id^='driverPanel']", app).forEach((panel) => {
      const visible = panel.id === target;
      panel.classList.toggle("driver-simple-visible", visible);
      panel.classList.toggle("driver-simple-hidden", !visible);
      panel.setAttribute("aria-hidden", visible ? "false" : "true");
    });
    if (!opts || opts.scroll !== false) {
      const panel = $(target);
      if (panel) {
        try { panel.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
      }
    }
  }

  function setProofStep(step, options) {
    const idx = PROOF_STEP_INDEX[step];
    if (Number.isInteger(idx) && typeof api().setProofWizardStep === "function") {
      try { api().setProofWizardStep(idx, { scroll: options && options.scroll !== false }); } catch (_) {}
    }
  }

  function proofMissing(call) {
    try {
      if (call && typeof api().proofMissingItems === "function") return api().proofMissingItems(call) || [];
    } catch (_) {}
    return [];
  }

  function preferredStepsForStatus(status) {
    return {
      motorista_no_local: ["retirada", "inspecao", "carregamento"],
      veiculo_carregado: ["carregamento", "transporte"],
      em_transporte: ["transporte"],
      entregue: ["entrega", "finalizacao"]
    }[status] || null;
  }

  function isPhotoMissingItem(item) {
    const group = String(item && item.group || "").toLowerCase();
    const label = String(item && item.label || "");
    return !!item && (group === "fotos" || item.target === "proofPhotoJustification" || /foto|fotos|evid[eê]ncia|imagem|comprovante/i.test(label));
  }

  function isSignatureMissingItem(item) {
    const label = String(item && item.label || "");
    return !!item && (/assin/i.test(label) || item.target === "driverSignatureSection" || item.target === "signatureAcceptedText" || item.target === "signatureRefusalReason");
  }

  function firstMissingForStatus(call) {
    const missing = proofMissing(call);
    if (!missing.length) return null;
    const status = normalizeStatus(call);
    const preferred = preferredStepsForStatus(status);
    const list = preferred ? missing.filter((item) => preferred.includes(item.step)) : missing;
    const scoped = list.length ? list : missing;
    return scoped.find(isPhotoMissingItem) || scoped.find(isSignatureMissingItem) || scoped[0];
  }

  function nextPhotoInputIdForStep(step) {
    const order = PHOTO_INPUTS_BY_STEP[step] || PHOTO_INPUTS_BY_STEP.inspecao;
    const found = order.find((id) => !!$(id));
    if (found) return found;
    const any = qsa('input[type="file"][accept*="image"]').find((input) => input.id && !/Expense|Report/i.test(input.id));
    return any && any.id || "";
  }

  function choosePhotoInput(inputId, source) {
    const input = inputId && $(inputId);
    if (!input) return false;
    lastPhotoInputId = inputId;
    setProofStep(proofStepForInput(inputId), { scroll: false });
    const wrap = input.closest && input.closest(".driver-image-picker-wrap");
    const btn = wrap && wrap.querySelector(source === "gallery" ? ".driver-image-gallery-btn" : ".driver-image-camera-btn");
    if (btn) { btn.click(); return true; }
    input.click();
    return true;
  }

  function returnToStreetMode() {
    document.body.classList.remove("driver-focus-technical", "driver-show-all");
    setVisiblePanel(PANEL_BY_STEP.atendimento, { scroll: false, technical: false });
    scheduleRender();
    const shell = $("driverSimpleShell");
    if (shell) {
      try { shell.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
    }
  }

  function openDriverModule(panelId) {
    setVisiblePanel(panelId, { scroll: true, technical: true });
    scheduleRender();
  }

  function proofStepForInput(inputId) {
    for (const step of Object.keys(PHOTO_INPUTS_BY_STEP)) {
      if ((PHOTO_INPUTS_BY_STEP[step] || []).includes(inputId)) return step;
    }
    return "inspecao";
  }

  function openProofTarget(target, step) {
    setProofStep(step || "inspecao", { scroll: false });
    document.body.classList.add("driver-focus-technical");
    setVisiblePanel(PANEL_BY_STEP.provas, { scroll: false });
    setTimeout(() => {
      if (target && typeof api().focusProofTarget === "function") {
        try { api().focusProofTarget(target, step); return; } catch (_) {}
      }
      const el = target && $(target) || $("driverPanelProofs");
      if (el) {
        try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (_) {}
        const focusable = el.matches && el.matches("input,select,textarea,button") ? el : el.querySelector && el.querySelector("input,select,textarea,button");
        if (focusable && typeof focusable.focus === "function") setTimeout(() => focusable.focus({ preventScroll: true }), 200);
      }
    }, 80);
  }

  function openJustificationFor(item) {
    if (isPhotoMissingItem(item)) return justifyAllPhotos(item);
    const step = item && item.step || "finalizacao";
    const target = {
      retirada: "proofStageRetiradaJustification",
      carregamento: "proofStageCarregamentoJustification",
      entrega: "proofStageEntregaJustification",
      finalizacao: "signatureRefusalReason"
    }[step] || item && item.target || "proofChecklistNotes";
    openProofTarget(target, step);
  }

  async function justifyAllPhotos(item) {
    const input = $("proofPhotoJustification");
    if (!input) return openProofTarget("proofPhotoJustification", item && item.step || "inspecao");
    const current = String(input.value || "").trim();
    const reason = current || window.prompt("Justifique as fotos/evidências desta etapa uma única vez:", "Não bati fotos.");
    if (!reason) return;
    input.value = reason.trim();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof api().saveProofDraft === "function") {
      try { await api().saveProofDraft({ silent: true, validate: false }); } catch (_) {}
    }
    setTimeout(scheduleRender, 250);
  }

  function runRoute(call) {
    const id = call && call.id;
    if (!id) return;
    if (typeof api().openExternalRouteForCall === "function") api().openExternalRouteForCall(id);
    else if (typeof api().openRouteForCall === "function") api().openRouteForCall(id);
  }

  async function runStatus(call, next) {
    if (!call || !next || busy) return;
    busy = true;
    render();
    try {
      if (typeof api().setStatus === "function") await api().setStatus(call.id, next);
      setTimeout(() => { busy = false; render(); }, 650);
    } catch (err) {
      busy = false;
      const msg = "Não consegui avançar: " + (err && err.message || "erro");
      if (window.JM && window.JM.utils && typeof window.JM.utils.toast === "function") window.JM.utils.toast(msg, "danger");
      else alert(msg);
      render();
    }
  }

  function actionForMissing(call, missing) {
    if (isPhotoMissingItem(missing)) {
      const step = missing.step || "inspecao";
      const inputId = nextPhotoInputIdForStep(step);
      const title = step === "entrega" ? "Registrar fotos da entrega" : step === "carregamento" ? "Registrar foto do carregamento" : "Registrar fotos da retirada";
      return {
        tone: "proof-photo",
        step: PROOF_STEP_TITLES[step] || "Fotos",
        title,
        detail: "Envie foto agora ou justifique uma vez se não tiver fotos.",
        primary: "TIRAR FOTO",
        secondary: "GALERIA",
        third: "NÃO TENHO FOTOS",
        run: () => choosePhotoInput(inputId, "camera") || openProofTarget(missing.target, step),
        runSecondary: () => choosePhotoInput(inputId, "gallery") || openProofTarget(missing.target, step),
        runThird: () => justifyAllPhotos(missing)
      };
    }

    if (isSignatureMissingItem(missing)) {
      return {
        tone: "proof-signature",
        step: "Assinatura",
        title: "Coletar assinatura",
        detail: "Cliente assina na tela. Se não assinar, justifique uma vez.",
        primary: "ASSINAR NA TELA",
        secondary: "JUSTIFICAR SEM ASSINATURA",
        run: () => openProofTarget("driverSignatureSection", "finalizacao"),
        runSecondary: () => openProofTarget("signatureRefusalReason", "finalizacao")
      };
    }

    return {
      tone: "proof-field",
      step: PROOF_STEP_TITLES[missing.step] || "Provas",
      title: missing.label || "Completar informação",
      detail: "Complete este item para avançar. Se não for possível, use justificativa.",
      primary: "RESOLVER AGORA",
      secondary: "JUSTIFICAR",
      run: () => openProofTarget(missing.target, missing.step),
      runSecondary: () => openJustificationFor(missing)
    };
  }

  function nextAction() {
    const call = currentCall();
    if (!call) {
      return {
        tone: "warn",
        step: "Chamado",
        title: "Escolha o atendimento",
        detail: "Toque para ver seus chamados e iniciar o trabalho.",
        primary: "VER CHAMADOS",
        run: () => setVisiblePanel(PANEL_BY_STEP.chamados)
      };
    }

    const status = normalizeStatus(call);
    if (status === "finalizado") {
      return {
        tone: "done",
        step: "Finalizado",
        title: "Atendimento finalizado",
        detail: "As provas ficam disponíveis para a central.",
        primary: "VER CHAMADOS",
        run: () => setVisiblePanel(PANEL_BY_STEP.chamados)
      };
    }

    const missing = firstMissingForStatus(call);
    if (missing && ["motorista_no_local", "veiculo_carregado", "entregue"].includes(status)) return actionForMissing(call, missing);

    if (status === "despachado" || status === "motorista_a_caminho") {
      return {
        tone: "route",
        step: "Ocorrência",
        title: status === "despachado" ? "Iniciar deslocamento" : "Chegou na ocorrência?",
        detail: status === "despachado" ? "Abra a rota e vá até o local." : "Confirme somente quando estiver no local.",
        primary: status === "despachado" ? "INICIAR DESLOCAMENTO" : "CHEGUEI",
        secondary: "ABRIR ROTA",
        run: () => runStatus(call, STATUS_NEXT[status] || "motorista_a_caminho"),
        runSecondary: () => runRoute(call)
      };
    }

    if (status === "motorista_no_local") {
      return {
        tone: "load",
        step: "Retirada",
        title: "Veículo carregado?",
        detail: "Depois de registrar as provas, confirme o carregamento.",
        primary: "VEÍCULO CARREGADO",
        run: () => runStatus(call, "veiculo_carregado")
      };
    }

    if (status === "veiculo_carregado") {
      return {
        tone: "transport",
        step: "Transporte",
        title: "Levar ao destino",
        detail: "Abra a rota do destino e inicie o transporte.",
        primary: "INICIAR TRANSPORTE",
        secondary: "ABRIR ROTA",
        run: () => runStatus(call, "em_transporte"),
        runSecondary: () => runRoute(call)
      };
    }

    if (status === "em_transporte") {
      return {
        tone: "destination",
        step: "Destino",
        title: "Chegou no destino?",
        detail: "Confirme chegada para registrar entrega e assinatura.",
        primary: "CHEGUEI NO DESTINO",
        secondary: "ABRIR ROTA",
        run: () => runStatus(call, "entregue"),
        runSecondary: () => runRoute(call)
      };
    }

    if (status === "entregue") {
      return {
        tone: "finish",
        step: "Finalização",
        title: "Finalizar atendimento",
        detail: "Finalize quando fotos/assinatura estiverem enviadas ou justificadas.",
        primary: "FINALIZAR",
        run: () => runStatus(call, "finalizado")
      };
    }

    const next = STATUS_NEXT[status] || "motorista_a_caminho";
    return {
      tone: "status",
      step: STATUS_LABEL[status] || "Atendimento",
      title: "Avançar atendimento",
      detail: "Toque para salvar e ir para o próximo passo.",
      primary: "CONTINUAR",
      run: () => runStatus(call, next)
    };
  }

  function render() {
    const shell = $("driverSimpleShell");
    if (!shell) return;
    const action = nextAction();
    const call = currentCall();
    const missingCount = call ? proofMissing(call).length : 0;
    const status = normalizeStatus(call);
    const busyHtml = busy ? '<div class="driver-street-saving">Salvando...</div>' : '';
    const showProofHint = /proof/.test(action.tone || "");

    shell.innerHTML = `
      <section class="driver-street ${esc(action.tone || "")}" aria-live="polite">
        <div class="driver-street-head">
          <span class="driver-street-badge">MODO RUA</span>
          <div class="driver-street-head-actions">
            ${document.body.classList.contains("driver-focus-technical") ? '<button class="btn good driver-street-back" id="driverStreetBackBtn" type="button">VOLTAR AO PASSO</button>' : ''}
            <button class="btn ghost driver-street-tech" id="driverStreetTechBtn" type="button">VER TUDO</button>
          </div>
        </div>
        <div class="driver-street-route">${esc(routeTitle(call))}</div>
        <article class="driver-street-card">
          <small>${esc(action.step || "Agora")}</small>
          <h2>${esc(action.title || "O que fazer agora")}</h2>
          <p>${esc(action.detail || "Toque no botão principal para continuar.")}</p>
          ${busyHtml}
          <button class="btn good driver-street-primary" id="driverStreetPrimaryBtn" type="button">${esc(action.primary || "CONTINUAR")}</button>
          <div class="driver-street-actions">
            ${action.secondary ? `<button class="btn driver-street-secondary" id="driverStreetSecondaryBtn" type="button">${esc(action.secondary)}</button>` : ""}
            ${action.third ? `<button class="btn danger driver-street-third" id="driverStreetThirdBtn" type="button">${esc(action.third)}</button>` : ""}
            <button class="btn" id="driverStreetExpenseBtn" type="button">DESPESA</button>
          </div>
          ${showProofHint ? '<div class="driver-street-hint">Sem fotos? Justifique uma vez. Sem assinatura? Justifique uma vez.</div>' : ''}
        </article>
        <nav class="driver-street-dock" aria-label="Acessos rápidos do motorista">
          <button class="driver-street-dock-btn" data-street-panel="${PANEL_BY_STEP.chamados}" type="button"><strong>Chamados</strong><span>trocar OS</span></button>
          <button class="driver-street-dock-btn" data-street-panel="${PANEL_BY_STEP.rota}" type="button"><strong>Mapa</strong><span>rota</span></button>
          <button class="driver-street-dock-btn" data-street-panel="${PANEL_BY_STEP.gps}" type="button"><strong>GPS</strong><span>localização</span></button>
          <button class="driver-street-dock-btn" data-street-panel="${PANEL_BY_STEP.provas}" type="button"><strong>Provas</strong><span>fotos/assin.</span></button>
          <button class="driver-street-dock-btn" data-street-panel="${PANEL_BY_STEP.despesas}" type="button"><strong>Despesa</strong><span>rápida</span></button>
          <button class="driver-street-dock-btn" data-street-panel="${PANEL_BY_STEP.atendimento}" data-street-all="true" type="button"><strong>Etapas</strong><span>histórico</span></button>
        </nav>
        <div class="driver-street-foot">
          <span>Status: ${esc(STATUS_LABEL[status] || status)}</span>
          <span>Pendências: ${missingCount}</span>
        </div>
      </section>`;

    $("driverStreetPrimaryBtn")?.addEventListener("click", () => action.run && action.run());
    $("driverStreetSecondaryBtn")?.addEventListener("click", () => action.runSecondary && action.runSecondary());
    $("driverStreetThirdBtn")?.addEventListener("click", () => action.runThird && action.runThird());
    $("driverStreetExpenseBtn")?.addEventListener("click", () => openDriverModule(PANEL_BY_STEP.despesas));
    $("driverStreetBackBtn")?.addEventListener("click", returnToStreetMode);
    $("driverStreetTechBtn")?.addEventListener("click", () => {
      document.body.classList.toggle("driver-show-all");
      document.body.classList.toggle("driver-focus-technical", document.body.classList.contains("driver-show-all"));
      if (!document.body.classList.contains("driver-show-all")) setVisiblePanel(PANEL_BY_STEP.atendimento, { scroll: false, technical: false });
      render();
    });
    qsa(".driver-street-dock-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.streetAll === "true") {
          document.body.classList.add("driver-show-all", "driver-focus-technical");
          render();
          return;
        }
        openDriverModule(btn.dataset.streetPanel || PANEL_BY_STEP.atendimento);
      });
    });

    if (!document.body.classList.contains("driver-show-all") && !document.body.classList.contains("driver-focus-technical")) {
      setVisiblePanel(PANEL_BY_STEP.atendimento, { scroll: false, technical: false });
    }
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }

  function installShell() {
    if ($("driverSimpleShell")) return;
    const grid = document.querySelector("#driverAppView main .grid");
    if (!grid) return;
    const shell = document.createElement("section");
    shell.id = "driverSimpleShell";
    shell.className = "panel col-12 driver-simple-shell driver-street-host no-collapse";
    grid.insertBefore(shell, grid.firstElementChild);
  }

  function installAutoStepAdvance() {
    Object.keys(SELECT_TO_STEP).forEach((id) => {
      const select = $(id);
      if (!select || select.dataset.seqBound === "true") return;
      select.dataset.seqBound = "true";
      select.addEventListener("change", async () => {
        const value = String(select.value || "");
        const step = SELECT_TO_STEP[id];
        if (!value || value === "pendente") return scheduleRender();
        setProofStep(step, { scroll: false });
        if (["avaria", "intercorrencia", "recusa", "justificado"].includes(value)) {
          openJustificationFor({ step });
          scheduleRender();
          return;
        }
        if (value === "ok" && typeof api().saveProofDraft === "function") {
          try { await api().saveProofDraft({ silent: true, validate: false }); } catch (_) {}
          setTimeout(() => {
            const missing = firstMissingForStatus(currentCall());
            if (missing) {
              if (isPhotoMissingItem(missing) || isSignatureMissingItem(missing)) render();
              else openProofTarget(missing.target, missing.step);
            } else if (typeof api().setProofWizardStep === "function") {
              const currentIndex = PROOF_STEP_INDEX[step] || 0;
              api().setProofWizardStep(Math.min(5, currentIndex + 1));
            }
            scheduleRender();
          }, 350);
        }
      });
    });

    qsa('input[type="file"]').forEach((input) => {
      if (input.dataset.seqFileBound === "true") return;
      input.dataset.seqFileBound = "true";
      input.addEventListener("change", () => {
        if (!input.files || !input.files.length) return scheduleRender();
        lastPhotoInputId = input.id || lastPhotoInputId;
        const saveBtn = $("driverSaveProofDraftBtn");
        if (saveBtn && !document.body.classList.contains("driver-show-all")) setTimeout(() => saveBtn.click(), 250);
        scheduleRender();
      });
    });
  }

  function observeLightly() {
    const ids = [
      "driverActiveCallBox", "driverHeaderActiveCall", "driverLocationStatus",
      "driverProofMissingBox", "driverStatusGuideTitle", "proofWizardTitle",
      "proofUploadQueue", "driverProofStatus", "driverCallsList"
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el || !window.MutationObserver || el.dataset.seqObserver === "true") return;
      el.dataset.seqObserver = "true";
      new MutationObserver(scheduleRender).observe(el, { childList: true, subtree: true, characterData: true });
    });
  }

  function init() {
    document.body.classList.add("driver-simple-mode", "driver-sequential-mode", "driver-street-mode");
    installShell();
    installAutoStepAdvance();
    observeLightly();
    render();
    setInterval(() => { installAutoStepAdvance(); observeLightly(); scheduleRender(); }, 2200);
    console.log("JM motorista modo rua", VERSION);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
