/* JM motorista V13 - sequencial automático
   Camada de UIX: uma ação por vez, avanço automático e preservação integral das provas, assinatura, GPS e despesas. */
(function () {
  "use strict";

  const VERSION = "jm-fluxo-operacional-v13-motorista-sequencial-automatico";
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
    despachado: "Atendimento liberado",
    motorista_a_caminho: "Indo para a ocorrência",
    motorista_no_local: "No local da ocorrência",
    veiculo_carregado: "Veículo carregado",
    em_transporte: "Em transporte",
    entregue: "Entregue no destino",
    finalizado: "Finalizado"
  };

  const NEXT_LABEL = {
    motorista_a_caminho: "INICIAR DESLOCAMENTO",
    motorista_no_local: "CHEGUEI NA OCORRÊNCIA",
    veiculo_carregado: "VEÍCULO CARREGADO",
    em_transporte: "INICIAR TRANSPORTE",
    entregue: "CHEGUEI NO DESTINO",
    finalizado: "FINALIZAR ATENDIMENTO"
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

  let renderTimer = null;
  let busy = false;

  function text(el) {
    return String(el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

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

  function callTitle(call) {
    if (!call) return "Nenhum atendimento selecionado";
    const proto = call.protocol || call.codigo || call.id || "Atendimento";
    const origin = call.originAddress || call.origem || call.origin || call.pickupAddress || "Origem";
    const dest = call.destinationAddress || call.destino || call.destination || call.dropoffAddress || "Destino";
    return `${proto} · ${origin} → ${dest}`;
  }

  function setVisiblePanel(panelId, options) {
    const app = $("driverAppView");
    if (!app) return;
    const target = panelId || PANEL_BY_STEP.atendimento;
    app.dataset.simplePanel = target;
    qsa(".panel[id^='driverPanel']", app).forEach((panel) => {
      const visible = panel.id === target;
      panel.classList.toggle("driver-simple-visible", visible);
      panel.classList.toggle("driver-simple-hidden", !visible);
      panel.setAttribute("aria-hidden", visible ? "false" : "true");
    });
    qsa("[data-driver-target], [data-driver-shortcut]").forEach((btn) => {
      const btnTarget = btn.getAttribute("data-driver-target") || btn.getAttribute("data-driver-shortcut");
      btn.classList.toggle("active", btnTarget === target);
    });
    if (!options || options.scroll !== false) {
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

  function openProofTarget(target, step) {
    setVisiblePanel(PANEL_BY_STEP.provas, { scroll: false });
    if (step) setProofStep(step, { scroll: false });
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

  function proofMissing(call) {
    try {
      if (call && typeof api().proofMissingItems === "function") return api().proofMissingItems(call) || [];
    } catch (_) {}
    return [];
  }

  function firstMissingForStatus(call) {
    const missing = proofMissing(call);
    if (!missing.length) return null;
    const status = normalizeStatus(call);
    const preferredSteps = {
      motorista_no_local: ["retirada", "inspecao", "carregamento"],
      veiculo_carregado: ["carregamento", "transporte"],
      em_transporte: ["transporte", "entrega"],
      entregue: ["entrega", "finalizacao"]
    }[status];
    if (!preferredSteps) return missing[0];
    return missing.find((item) => preferredSteps.includes(item.step)) || missing[0];
  }

  function missingActionLabel(item) {
    if (!item) return "COMPLETAR PROVAS";
    const label = String(item.label || "evidência");
    if (/assin/i.test(label) || item.target === "driverSignatureSection") return "ASSINAR / JUSTIFICAR";
    if (/foto|frente|traseira|lateral|painel|comprovante/i.test(label)) return "ENVIAR FOTO";
    if (/justificar|justificativa/i.test(label)) return "JUSTIFICAR";
    return "COMPLETAR AGORA";
  }

  function nextAction() {
    const call = currentCall();
    if (!call) {
      return {
        tone: "warn",
        step: "Selecionar chamado",
        title: "Escolha o atendimento",
        detail: "Toque em um chamado para liberar rota, GPS, provas, assinatura e despesas.",
        primary: "VER MEUS CHAMADOS",
        run: () => setVisiblePanel(PANEL_BY_STEP.chamados)
      };
    }

    const status = normalizeStatus(call);
    if (status === "finalizado") {
      return {
        tone: "done",
        step: "Finalizado",
        title: "Atendimento finalizado",
        detail: "Nada mais é obrigatório. As provas e assinatura ficam disponíveis para a central.",
        primary: "VER CHAMADOS",
        run: () => setVisiblePanel(PANEL_BY_STEP.chamados)
      };
    }

    const missing = firstMissingForStatus(call);
    if (missing && ["motorista_no_local", "veiculo_carregado", "entregue"].includes(status)) {
      const stepTitle = PROOF_STEP_TITLES[missing.step] || "Provas";
      return {
        tone: "proof",
        step: stepTitle,
        title: missing.label || "Completar evidência",
        detail: missing.hint || "Prova ou justificativa obrigatória antes de avançar.",
        primary: missingActionLabel(missing),
        secondary: "JUSTIFICAR SE NÃO TIVER",
        run: () => openProofTarget(missing.target, missing.step),
        runSecondary: () => openJustificationFor(missing)
      };
    }

    const next = STATUS_NEXT[status] || "motorista_a_caminho";
    const statusSpecific = {
      motorista_a_caminho: {
        step: "Deslocamento",
        title: "Ir até a ocorrência",
        detail: "Abra a rota e mantenha a localização ativa. Ao chegar, toque no botão grande.",
        primary: NEXT_LABEL[next],
        secondary: "ABRIR ROTA",
        runSecondary: () => runRoute(call)
      },
      motorista_no_local: {
        step: "Chegada",
        title: "Você chegou na ocorrência?",
        detail: "Confirme chegada para iniciar as provas do veículo.",
        primary: NEXT_LABEL[next]
      },
      veiculo_carregado: {
        step: "Provas",
        title: "Registrar retirada e carregamento",
        detail: "Antes do transporte, registre as fotos/condições ou justifique o que não for possível.",
        primary: "ABRIR PROVAS",
        run: () => openProofTarget(null, "retirada")
      },
      em_transporte: {
        step: "Transporte",
        title: "Iniciar transporte ao destino",
        detail: "Com o veículo carregado, abra a rota para o destino e mantenha o GPS ativo.",
        primary: NEXT_LABEL[next],
        secondary: "ABRIR ROTA",
        runSecondary: () => runRoute(call)
      },
      entregue: {
        step: "Destino",
        title: "Chegou ao destino?",
        detail: "Confirme chegada para registrar entrega, assinatura e foto final.",
        primary: NEXT_LABEL[next]
      },
      finalizado: {
        step: "Entrega",
        title: "Finalizar com provas e assinatura",
        detail: "Se o cliente não assinar, registre justificativa. Sem prova ou justificativa, o sistema bloqueia.",
        primary: NEXT_LABEL[next],
        secondary: "ASSINATURA",
        runSecondary: () => openProofTarget("driverSignatureSection", "finalizacao")
      }
    }[next] || {
      step: STATUS_LABEL[status] || "Atendimento",
      title: "Avançar etapa",
      detail: "Toque no botão grande para salvar e avançar uma etapa.",
      primary: NEXT_LABEL[next] || "AVANÇAR"
    };

    if (!statusSpecific.run) statusSpecific.run = () => runStatus(call, next);
    return Object.assign({ tone: "status" }, statusSpecific);
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
      setTimeout(() => {
        busy = false;
        render();
      }, 650);
    } catch (err) {
      busy = false;
      if (window.JM && window.JM.utils && typeof window.JM.utils.toast === "function") {
        window.JM.utils.toast("Não consegui avançar: " + (err && err.message || "erro"), "danger");
      }
      render();
    }
  }

  function openJustificationFor(item) {
    const step = item && item.step || "finalizacao";
    const stageJustification = {
      retirada: "proofStageRetiradaJustification",
      carregamento: "proofStageCarregamentoJustification",
      entrega: "proofStageEntregaJustification",
      finalizacao: "signatureRefusalReason"
    }[step] || "proofChecklistNotes";
    openProofTarget(stageJustification, step);
  }

  function choosePhotoInput(inputId, source) {
    const input = inputId && $(inputId);
    if (!input) return false;
    const wrap = input.closest && input.closest(".driver-image-picker-wrap");
    const btn = wrap && wrap.querySelector(source === "gallery" ? ".driver-image-gallery-btn" : ".driver-image-camera-btn");
    if (btn) { btn.click(); return true; }
    input.click();
    return true;
  }

  function nextPhotoTarget() {
    const call = currentCall();
    const missing = firstMissingForStatus(call);
    if (!missing) return null;
    const target = missing.target && $(missing.target) ? missing.target : null;
    if (target && $(target).matches && $(target).matches('input[type="file"]')) return { inputId: target, item: missing };
    return null;
  }

  function render() {
    const shell = $("driverSimpleShell");
    if (!shell) return;
    const action = nextAction();
    const call = currentCall();
    const missing = call ? proofMissing(call) : [];
    const photoTarget = nextPhotoTarget();
    const loading = busy ? '<div class="driver-seq-saving">Salvando...</div>' : '';
    const proofRule = '<div class="driver-seq-rule">Prova obrigatória: envie a foto/assinatura ou justifique. Nada fica oculto para a central.</div>';

    shell.innerHTML = `
      <div class="driver-seq-shell ${action.tone || ""}">
        <div class="driver-seq-top">
          <span>Modo motorista automático</span>
          <button class="btn" id="driverSimpleShowAllBtn" type="button">Módulos técnicos</button>
        </div>
        <article class="driver-seq-card">
          <div class="driver-seq-step">${esc(action.step || "Próxima ação")}</div>
          <h2>${esc(action.title || "O que fazer agora")}</h2>
          <p>${esc(action.detail || "Toque no botão grande para continuar.")}</p>
          ${loading}
          <button class="btn good driver-seq-primary" id="driverSeqPrimaryBtn" type="button">${esc(action.primary || "CONTINUAR")}</button>
          <div class="driver-seq-secondary-row">
            ${action.secondary ? `<button class="btn driver-seq-secondary" id="driverSeqSecondaryBtn" type="button">${esc(action.secondary)}</button>` : ""}
            <button class="btn" id="driverSeqExpenseBtn" type="button">Despesa rápida</button>
          </div>
          ${photoTarget ? `<div class="driver-seq-photo-row"><button class="btn primary" id="driverSeqCameraBtn" type="button">Tirar foto</button><button class="btn" id="driverSeqGalleryBtn" type="button">Galeria</button></div>` : ""}
          ${proofRule}
        </article>
        <div class="driver-seq-mini">
          <strong>${esc(callTitle(call)).slice(0, 220)}</strong>
          <span>Status: ${esc(STATUS_LABEL[normalizeStatus(call)] || normalizeStatus(call))}</span>
          <span>Pendências: ${missing.length}</span>
        </div>
        <nav class="driver-seq-shortcuts" aria-label="Atalhos rápidos">
          <button data-driver-target="driverPanelCalls" type="button">Chamados</button>
          <button data-driver-target="driverPanelMap" type="button">Rota</button>
          <button data-driver-target="driverPanelProofs" type="button">Provas</button>
          <button data-driver-target="driverPanelExpense" type="button">Despesa</button>
        </nav>
      </div>`;

    $("driverSeqPrimaryBtn")?.addEventListener("click", () => action.run && action.run());
    $("driverSeqSecondaryBtn")?.addEventListener("click", () => action.runSecondary && action.runSecondary());
    $("driverSeqExpenseBtn")?.addEventListener("click", () => setVisiblePanel(PANEL_BY_STEP.despesas));
    $("driverSimpleShowAllBtn")?.addEventListener("click", () => {
      document.body.classList.toggle("driver-show-all");
      render();
    });
    $("driverSeqCameraBtn")?.addEventListener("click", () => choosePhotoInput(photoTarget && photoTarget.inputId, "camera"));
    $("driverSeqGalleryBtn")?.addEventListener("click", () => choosePhotoInput(photoTarget && photoTarget.inputId, "gallery"));
    qsa(".driver-seq-shortcuts [data-driver-target]").forEach((btn) => btn.addEventListener("click", () => setVisiblePanel(btn.dataset.driverTarget)));

    if (!document.body.classList.contains("driver-show-all")) {
      const panel = action.step === "Selecionar chamado" ? PANEL_BY_STEP.chamados : (action.tone === "proof" ? PANEL_BY_STEP.provas : PANEL_BY_STEP.atendimento);
      setVisiblePanel(panel, { scroll: false });
    }
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 150);
  }

  function installShell() {
    if ($("driverSimpleShell")) return;
    const grid = document.querySelector("#driverAppView main .grid");
    if (!grid) return;
    const shell = document.createElement("section");
    shell.id = "driverSimpleShell";
    shell.className = "panel col-12 driver-simple-shell driver-seq-host no-collapse";
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
        // Se for uma etapa que precisa de explicação, não avança sem justificativa.
        if (["avaria", "intercorrencia", "recusa", "justificado"].includes(value)) {
          openJustificationFor({ step });
          scheduleRender();
          return;
        }
        // OK: salva rascunho e aponta automaticamente para a próxima pendência.
        if (value === "ok" && typeof api().saveProofDraft === "function") {
          try { await api().saveProofDraft({ silent: true, validate: false }); } catch (_) {}
          setTimeout(() => {
            const missing = firstMissingForStatus(currentCall());
            if (missing) openProofTarget(missing.target, missing.step);
            else if (typeof api().setProofWizardStep === "function") {
              const currentIndex = PROOF_STEP_INDEX[step] || 0;
              api().setProofWizardStep(Math.min(5, currentIndex + 1));
            }
            scheduleRender();
          }, 450);
        }
      });
    });

    qsa('input[type="file"]').forEach((input) => {
      if (input.dataset.seqFileBound === "true") return;
      input.dataset.seqFileBound = "true";
      input.addEventListener("change", () => {
        if (!input.files || !input.files.length) return scheduleRender();
        const saveBtn = $("driverSaveProofDraftBtn");
        if (saveBtn && !document.body.classList.contains("driver-show-all")) {
          setTimeout(() => saveBtn.click(), 250);
        }
        scheduleRender();
      });
    });
  }

  function observeLightly() {
    const ids = [
      "driverActiveCallBox", "driverHeaderActiveCall", "driverLocationStatus",
      "driverProofMissingBox", "driverStatusGuideTitle", "proofWizardTitle",
      "proofUploadQueue", "driverProofStatus"
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el || !window.MutationObserver || el.dataset.seqObserver === "true") return;
      el.dataset.seqObserver = "true";
      new MutationObserver(scheduleRender).observe(el, { childList: true, subtree: true, characterData: true });
    });
  }

  function init() {
    document.body.classList.add("driver-simple-mode", "driver-sequential-mode");
    installShell();
    installAutoStepAdvance();
    observeLightly();
    render();
    setInterval(() => { installAutoStepAdvance(); observeLightly(); scheduleRender(); }, 2500);
    console.log("JM motorista sequencial automático", VERSION);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
