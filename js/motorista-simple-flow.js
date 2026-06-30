/* JM motorista V24 - Modo motorista popular
   Atalhos explícitos, lista de pendências clicável e ABRIR indo direto no alvo. */
(function () {
  "use strict";

  const VERSION = "jm-fluxo-operacional-v31-motorista-cloudinary-real-flow";
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

  function addressText(value, fallback) {
    if (!value) return fallback || "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const direct = value.label || value.address || value.endereco || value.formatted || value.name || value.nome || value.descricao || value.texto || value.local || value.localizacao;
      if (direct) return direct;
      const street = [value.logradouro, value.numero, value.bairro].filter(Boolean).join(", ");
      const city = [value.cidade, value.estado || value.uf].filter(Boolean).join(" - ");
      const combo = [street, city].filter(Boolean).join(" • ");
      if (combo) return combo;
      const firstUseful = Object.keys(value).map((key) => value[key]).find((entry) => typeof entry === "string" && entry.trim());
      if (firstUseful) return firstUseful;
    }
    return String(value || fallback || "");
  }

  function routeTitle(call) {
    if (!call) return "Nenhum chamado selecionado";
    const origin = addressText(call.originAddress || call.origem || call.origin || call.pickupAddress, "Origem");
    const dest = addressText(call.destinationAddress || call.destino || call.destination || call.dropoffAddress, "Destino");
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

  function resolveMissingStep(item) {
    if (item && item.step) return item.step;
    const target = String(item && item.target || "");
    if (/Pickup|Retirada/i.test(target)) return "retirada";
    if (/Fuel|Odometer|Tire|KeyDocument|VehicleLoaded|EasyRemoval|Damage/i.test(target)) return "inspecao";
    if (/Carregamento|LoadAfter/i.test(target)) return "carregamento";
    if (/Transporte/i.test(target)) return "transporte";
    if (/Delivery|Entrega/i.test(target)) return "entrega";
    if (/signature|Finalizacao|Finaliza/i.test(target)) return "finalizacao";
    return "inspecao";
  }

  function resolveMissingTarget(item) {
    const rawTarget = String(item && item.target || "").trim();
    if (rawTarget && $(rawTarget)) return rawTarget;
    const step = resolveMissingStep(item);
    const label = String(item && item.label || "");
    if (isPhotoMissingItem(item)) return "proofPhotoJustification";
    if (isSignatureMissingItem(item)) return "driverSignatureSection";
    if (/aceite/i.test(label)) return "signatureAcceptedText";
    if (/documento/i.test(label) && step === "retirada") return "proofPickupResponsibleDoc";
    if (/documento/i.test(label) && step === "entrega") return "proofDeliveryResponsibleDoc";
    if (/respons[aá]vel/i.test(label) && step === "retirada") return "proofPickupResponsibleName";
    if (/respons[aá]vel/i.test(label) && step === "entrega") return "proofDeliveryResponsibleName";
    const fallback = {
      retirada: "proofStageRetirada",
      inspecao: "proofFuelLevel",
      carregamento: "proofStageCarregamento",
      transporte: "proofStageTransporte",
      entrega: "proofStageEntrega",
      finalizacao: "driverSignatureSection"
    };
    return fallback[step] || "driverPanelProofs";
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
    document.body.classList.remove("driver-focus-technical", "driver-show-all", "driver-signature-only");
    setVisiblePanel(PANEL_BY_STEP.atendimento, { scroll: false, technical: false });
    scheduleRender();
    const shell = $("driverSimpleShell");
    if (shell) {
      try { shell.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
    }
  }

  function openDriverModule(panelId) {
    document.body.classList.remove("driver-signature-only");
    setVisiblePanel(panelId, { scroll: true, technical: true });
    scheduleRender();
  }

  function openAllDetails() {
    closeMenu();
    closeMissingList();
    document.body.classList.remove("driver-signature-only");
    document.body.classList.add("driver-show-all", "driver-focus-technical");
    const app = $("driverAppView");
    if (app) app.dataset.simplePanel = PANEL_BY_STEP.atendimento;
    scheduleRender();
    const active = $("driverPanelActive") || $("driverSimpleShell");
    if (active) {
      try { active.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
    }
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
    const accepted = $("signatureAcceptedText");
    if (accepted && !String(accepted.value || "").trim()) accepted.value = "Assinatura não coletada. Motorista registrou justificativa operacional.";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof api().saveProofDraft === "function") {
      try { await api().saveProofDraft({ silent: true, validate: false }); } catch (_) {}
    }
    setTimeout(scheduleRender, 250);
  }

  async function justifySignatureFast() {
    const input = $("signatureRefusalReason");
    if (!input) return openProofTarget("signatureRefusalReason", "finalizacao");
    const current = String(input.value || "").trim();
    const reason = current || window.prompt("Por que não teve assinatura?", "Cliente não assinou.");
    if (!reason) return;
    input.value = reason.trim();
    const accepted = $("signatureAcceptedText");
    if (accepted && !String(accepted.value || "").trim()) accepted.value = "Assinatura não coletada. Motorista registrou justificativa operacional.";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof api().saveProofDraft === "function") {
      try { await api().saveProofDraft({ silent: true, validate: false }); } catch (_) {}
    }
    setTimeout(scheduleRender, 250);
  }

  function openSignatureOnly() {
    document.body.classList.add("driver-signature-only");
    openProofTarget("driverSignatureSection", "finalizacao");
  }

  function closeMenu() {
    document.body.classList.remove("driver-popular-menu-open");
    scheduleRender();
  }

  function toggleMissingList() {
    document.body.classList.toggle("driver-popular-missing-open");
    scheduleRender();
  }

  function closeMissingList() {
    document.body.classList.remove("driver-popular-missing-open");
    scheduleRender();
  }

  function missingItemButtonText(item, index) {
    const label = String(item && item.label || "Pendência").trim();
    const group = String(item && (item.group || PROOF_STEP_TITLES[item.step]) || "").trim();
    return `${index + 1}. ${group ? group + " — " : ""}${label}`;
  }

  function goToMissing(item) {
    if (!item) return;
    closeMenu();
    closeMissingList();
    const resolvedStep = resolveMissingStep(item);
    const resolvedTarget = resolveMissingTarget(item);
    if (isPhotoMissingItem(item)) {
      const act = actionForMissing(currentCall(), item);
      if (act && act.run) return act.run();
    }
    if (isSignatureMissingItem(item)) return openSignatureOnly();
    openProofTarget(resolvedTarget, resolvedStep);
  }

  function renderMissingList(call) {
    const items = call ? proofMissing(call) : [];
    if (!items.length) return '';
    const open = document.body.classList.contains("driver-popular-missing-open");
    if (!open) return '';
    return `
      <div class="driver-popular-missing-list" id="driverPopularMissingList">
        <div class="driver-popular-missing-head">
          <strong>Resolver pendências</strong>
          <button id="driverCloseMissingListBtn" type="button">Fechar</button>
        </div>
        <p>Toque no item. O sistema abre direto onde precisa preencher, fotografar ou assinar.</p>
        <div class="driver-popular-missing-items">
          ${items.map((item, index) => `
            <button type="button" data-missing-index="${index}">
              <span>${esc(missingItemButtonText(item, index))}</span>
              <small>ABRIR</small>
            </button>
          `).join('')}
        </div>
      </div>`;
  }

  function openQuickPanel(panelKey) {
    const target = PANEL_BY_STEP[panelKey] || panelKey || PANEL_BY_STEP.atendimento;
    closeMenu();
    closeMissingList();
    openDriverModule(target);
  }

  function toggleMenu() {
    document.body.classList.toggle("driver-popular-menu-open");
    scheduleRender();
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


  async function resetProofsFlow(scope) {
    const call = currentCall();
    if (!call || !api() || typeof api().resetProofs !== "function") {
      openQuickPanel(PANEL_BY_STEP.provas);
      return;
    }
    const all = scope === "all";
    const ok = window.confirm(all
      ? "Zerar TODAS as provas deste atendimento e começar do zero?"
      : "Reiniciar somente esta etapa e refazer as provas dela?");
    if (!ok) return;
    busy = true;
    render();
    try {
      await api().resetProofs(all ? "all" : "stage");
      openQuickPanel(PANEL_BY_STEP.provas);
    } catch (err) {
      const msg = "Não consegui zerar provas: " + (err && (err.code || err.message) || "erro");
      if (window.JM && window.JM.utils && typeof window.JM.utils.toast === "function") window.JM.utils.toast(msg, "danger");
      else alert(msg);
    } finally {
      busy = false;
      scheduleRender();
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
        title: "Foto do veículo",
        detail: "Tire a foto ou escolha da galeria.",
        primary: "TIRAR FOTO",
        secondary: "GALERIA",
        third: "SEM FOTO",
        run: () => choosePhotoInput(inputId, "camera") || openProofTarget(missing.target, step),
        runSecondary: () => choosePhotoInput(inputId, "gallery") || openProofTarget(missing.target, step),
        runThird: () => justifyAllPhotos(missing)
      };
    }

    if (isSignatureMissingItem(missing)) {
      return {
        tone: "proof-signature",
        step: "Assinatura",
        title: "Assinatura",
        detail: "Assine ou toque NÃO ASSINOU e justifique. Nome/documento não bloqueiam recusa.",
        primary: "ASSINAR",
        secondary: "NÃO ASSINOU",
        run: () => openSignatureOnly(),
        runSecondary: () => justifySignatureFast()
      };
    }

    return {
      tone: "proof-field",
      step: PROOF_STEP_TITLES[missing.step] || "Provas",
      title: "Resolver pendência",
      detail: missing.label || "Falta uma informação.",
      primary: "ABRIR",
      secondary: "JUSTIFICAR",
      run: () => goToMissing(missing),
      runSecondary: () => openJustificationFor(missing)
    };
  }

  function nextAction() {
    const call = currentCall();
    if (!call) {
      return {
        tone: "warn",
        step: "Chamado",
        title: "Escolha uma OS",
        detail: "",
        primary: "MEUS CHAMADOS",
        run: () => setVisiblePanel(PANEL_BY_STEP.chamados)
      };
    }

    const status = normalizeStatus(call);
    if (status === "finalizado") {
      return {
        tone: "done",
        step: "Finalizado",
        title: "Finalizado",
        detail: "",
        primary: "MEUS CHAMADOS",
        run: () => setVisiblePanel(PANEL_BY_STEP.chamados)
      };
    }

    const missing = firstMissingForStatus(call);
    if (missing && ["motorista_no_local", "veiculo_carregado", "entregue"].includes(status)) return actionForMissing(call, missing);

    if (status === "despachado" || status === "motorista_a_caminho") {
      return {
        tone: "route",
        step: "Ocorrência",
        title: status === "despachado" ? "Ir para o local" : "Já chegou?",
        detail: status === "despachado" ? "" : "",
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
        title: "Carregou o veículo?",
        detail: "",
        primary: "VEÍCULO CARREGADO",
        run: () => runStatus(call, "veiculo_carregado")
      };
    }

    if (status === "veiculo_carregado") {
      return {
        tone: "transport",
        step: "Transporte",
        title: "Levar ao destino",
        detail: "",
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
        detail: "",
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
        title: "Finalizar",
        detail: "",
        primary: "FINALIZAR",
        run: () => runStatus(call, "finalizado")
      };
    }

    const next = STATUS_NEXT[status] || "motorista_a_caminho";
    return {
      tone: "status",
      step: STATUS_LABEL[status] || "Atendimento",
      title: "Continuar",
      detail: "",
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
    const busyHtml = busy ? '<div class="driver-popular-saving">Salvando...</div>' : '';
    const detailHtml = action.detail ? `<p>${esc(action.detail)}</p>` : "";
    const menuOpen = document.body.classList.contains("driver-popular-menu-open");
    const route = routeTitle(call);

    shell.innerHTML = `
      <section class="driver-popular ${esc(action.tone || "")}" aria-live="polite">
        <div class="driver-popular-top">
          <div>
            <span class="driver-popular-badge">MOTORISTA</span>
            <strong class="driver-popular-route">${esc(route)}</strong>
          </div>
          <button class="driver-popular-menu-btn" id="driverPopularMenuBtn" type="button">MAIS</button>
        </div>
        ${menuOpen ? `
          <div class="driver-popular-menu" id="driverPopularMenu">
            <button data-street-panel="${PANEL_BY_STEP.chamados}" type="button">Chamados</button>
            <button data-driver-finalized="true" type="button">Finalizados</button>
            <button data-quick-panel="rota" type="button">Rota / GPS</button>
            <button data-quick-panel="provas" type="button">Fotos / Provas</button>
            ${call && status !== "finalizado" ? `<button data-driver-reset-proofs="all" type="button">Zerar provas</button>` : ""}
            <button data-street-panel="${PANEL_BY_STEP.despesas}" type="button">Despesa</button>
            <button data-driver-notify="true" type="button">Avisos</button>
            <button data-street-panel="${PANEL_BY_STEP.atendimento}" data-street-all="true" type="button">Detalhes</button>
          </div>` : ""}
        <article class="driver-popular-card">
          <small>${esc(action.step || "Agora")}</small>
          <h1>${esc(action.title || "O que fazer agora?")}</h1>
          ${detailHtml}
          ${busyHtml}
          <button class="driver-popular-primary" id="driverStreetPrimaryBtn" type="button">${esc(action.primary || "CONTINUAR")}</button>
          <div class="driver-popular-actions">
            ${action.secondary ? `<button id="driverStreetSecondaryBtn" type="button">${esc(action.secondary)}</button>` : ""}
            ${action.third ? `<button class="warn" id="driverStreetThirdBtn" type="button">${esc(action.third)}</button>` : ""}
          </div>
          <div class="driver-popular-shortcuts" aria-label="Acessos rápidos do motorista">
            <button data-quick-panel="rota" type="button">ROTA / GPS</button>
            <button data-quick-panel="provas" type="button">FOTOS / PROVAS</button>
            <button data-street-panel="${PANEL_BY_STEP.atendimento}" data-street-all="true" type="button">DETALHES</button>
            ${call && status !== "finalizado" ? `<button class="danger" id="driverStreetResetProofsBtn" type="button">ZERAR PROVAS</button>` : ""}
          </div>
          <button class="driver-popular-expense" id="driverStreetExpenseBtn" type="button">DESPESA RÁPIDA</button>
        </article>
        <div class="driver-popular-foot">
          <span>${esc(STATUS_LABEL[status] || status)}</span>
          ${missingCount ? `<button class="driver-popular-missing-btn" id="driverStreetMissingBtn" type="button">Faltam ${missingCount} · resolver</button>` : '<span>Tudo ok</span>'}
        </div>
        ${renderMissingList(call)}
      </section>`;

    $("driverStreetPrimaryBtn")?.addEventListener("click", () => action.run && action.run());
    $("driverStreetSecondaryBtn")?.addEventListener("click", () => action.runSecondary && action.runSecondary());
    $("driverStreetThirdBtn")?.addEventListener("click", () => action.runThird && action.runThird());
    $("driverStreetMissingBtn")?.addEventListener("click", toggleMissingList);
    $("driverCloseMissingListBtn")?.addEventListener("click", closeMissingList);
    qsa("[data-missing-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.missingIndex);
        const item = proofMissing(currentCall())[idx];
        goToMissing(item);
      });
    });
    $("driverStreetExpenseBtn")?.addEventListener("click", () => { closeMenu(); closeMissingList(); openDriverModule(PANEL_BY_STEP.despesas); });
    $("driverStreetResetProofsBtn")?.addEventListener("click", () => resetProofsFlow("all"));
    qsa("[data-driver-reset-proofs]").forEach((btn) => btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      closeMissingList();
      resetProofsFlow(btn.dataset.driverResetProofs || "all");
    }));
    $("driverPopularMenuBtn")?.addEventListener("click", toggleMenu);
    qsa("[data-quick-panel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.quickPanel;
        if (key === "rota") return openQuickPanel(PANEL_BY_STEP.rota);
        if (key === "provas") return openQuickPanel(PANEL_BY_STEP.provas);
        openQuickPanel(key);
      });
    });
    qsa(".driver-popular-menu button[data-driver-notify]").forEach((btn) => {
      btn.addEventListener("click", async () => { closeMenu(); closeMissingList(); await requestDriverNotifications(true); });
    });
    qsa(".driver-popular-menu button[data-driver-finalized]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        closeMissingList();
        document.body.classList.remove("driver-signature-only", "driver-show-all");
        if (api() && typeof api().setCallsView === "function") {
          try { api().setCallsView("finalizados"); } catch (_) {}
        }
        openDriverModule(PANEL_BY_STEP.chamados);
      });
    });
    qsa("[data-street-all]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openAllDetails();
      });
    });
    qsa(".driver-popular-menu button:not([data-driver-notify]):not([data-quick-panel]):not([data-driver-finalized]):not([data-street-all])").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeMenu();
        closeMissingList();
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

  function installProofWizardSafety() {
    const tabs = $("proofWizardTabs");
    if (tabs && tabs.dataset.streetSafetyBound !== "true") {
      tabs.dataset.streetSafetyBound = "true";
      tabs.addEventListener("click", (event) => {
        const button = event.target && event.target.closest && event.target.closest("[data-proof-index]");
        if (!button) return;
        document.body.classList.remove("driver-signature-only");
        setVisiblePanel(PANEL_BY_STEP.provas, { scroll: false, technical: true });
        const idx = Number(button.dataset.proofIndex);
        if (Number.isFinite(idx) && api() && typeof api().setProofWizardStep === "function") {
          try { api().setProofWizardStep(idx, { scroll: true }); } catch (_) {}
        }
      }, true);
    }

    const next = $("driverProofNextBtn");
    if (next && next.dataset.streetSafetyBound !== "true") {
      next.dataset.streetSafetyBound = "true";
      next.addEventListener("click", async (event) => {
        /* V25: o botão CONTINUAR precisa sempre responder.
           O handler original de motorista.js usa uma função local, então o teste F12 não consegue interceptar.
           Aqui usamos a API pública, preservamos o fluxo e evitamos a sensação de clique morto. */
        if (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
        const call = currentCall();
        if (!call) {
          openDriverModule(PANEL_BY_STEP.chamados);
          return;
        }
        const missing = proofMissing(call);
        const statusBox = $("driverProofStatus");
        const hasError = statusBox && /falta|obrigat|pendente|complete|preencha/i.test(String(statusBox.textContent || ""));
        if (missing.length && hasError) {
          goToMissing(missing[0]);
          return;
        }
        try {
          if (api() && typeof api().saveProofDraft === "function") {
            await api().saveProofDraft({ silent: true, validate: false });
          }
        } catch (_) {}
        const st = state();
        const currentIndex = Number(st && st.proofWizardStep || 0);
        if (api() && typeof api().setProofWizardStep === "function") {
          try { api().setProofWizardStep(Math.min(5, currentIndex + 1), { scroll: true }); } catch (_) {}
        }
        scheduleRender();
      }, true);
    }
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

  async function requestDriverNotifications(showFeedback) {
    if (!("Notification" in window)) {
      if (showFeedback) alert("Este navegador não suporta avisos fora da tela.");
      return false;
    }
    if (Notification.permission === "granted") {
      if (showFeedback) alert("Avisos já estão ativados para novos chamados.");
      return true;
    }
    if (Notification.permission === "denied") {
      if (showFeedback) alert("Os avisos estão bloqueados no navegador. Libere nas permissões do site.");
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      if (showFeedback) alert(result === "granted" ? "Avisos ativados." : "Avisos não foram ativados.");
      return result === "granted";
    } catch (_) {
      if (showFeedback) alert("Não consegui pedir permissão de aviso neste navegador.");
      return false;
    }
  }

  window.JMDriverStreetNotify = { request: requestDriverNotifications };

  function init() {
    document.body.classList.add("driver-simple-mode", "driver-sequential-mode", "driver-street-mode", "driver-popular-mode");
    installShell();
    installAutoStepAdvance();
    installProofWizardSafety();
    observeLightly();
    render();
    setInterval(() => { installAutoStepAdvance(); installProofWizardSafety(); observeLightly(); scheduleRender(); }, 2200);
    console.log("JM motorista modo rua", VERSION);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
