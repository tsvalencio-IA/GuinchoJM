/* JM motorista 20/10 - fluxo simples sem remover lógicas
   Camada de UX: mostra uma tela por vez, mantém todos os formulários e salvamentos originais. */
(function () {
  "use strict";

  const VERSION = "jm-fluxo-operacional-v12-motorista-uix-20-10";
  const $ = (id) => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const PANEL_LABELS = {
    driverPanelActive: "Atendimento",
    driverPanelCalls: "Chamados",
    driverPanelMap: "Rota / GPS",
    driverPanelProofs: "Provas",
    driverPanelExpense: "Despesas"
  };

  const STEP_HELP = {
    retirada: {
      title: "Retirada",
      action: "Confirme quem entregou o veículo e registre a chegada.",
      hint: "Preencha somente os campos desta etapa. Fotos e detalhes técnicos ficam na etapa Inspeção."
    },
    inspecao: {
      title: "Inspeção",
      action: "Registre condição do veículo e fotos antes do carregamento.",
      hint: "Use Tirar foto ou Galeria. O sistema mantém o checklist completo por trás."
    },
    carregamento: {
      title: "Carregamento",
      action: "Confirme o veículo carregado no guincho.",
      hint: "Inclua a foto do veículo já carregado e avance para Transporte."
    },
    transporte: {
      title: "Transporte",
      action: "Siga a rota e mantenha o GPS ativo.",
      hint: "Nesta etapa não misturamos checklist inteiro: use Rota/GPS ou registre intercorrência se houver."
    },
    entrega: {
      title: "Entrega",
      action: "Registre responsável, documento e fotos no destino.",
      hint: "Confira se as fotos finais foram anexadas antes da assinatura."
    },
    finalizacao: {
      title: "Finalização",
      action: "Coletar assinatura, aceite ou justificativa de recusa.",
      hint: "Finalize apenas quando não houver pendência."
    }
  };

  function text(el) {
    return String(el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function hasActiveCall() {
    const t = (text($("driverHeaderActiveCall")) + " " + text($("driverActiveCallBox"))).toLowerCase();
    return t && !/nenhum atendimento|escolha um chamado|selecione um atendimento/.test(t);
  }

  function currentProofStepKey() {
    const active = document.querySelector("#proofWizardTabs .proof-wizard-tab.active");
    const idx = active ? Number(active.getAttribute("data-proof-index")) : -1;
    const keys = ["retirada", "inspecao", "carregamento", "transporte", "entrega", "finalizacao"];
    return keys[idx] || "retirada";
  }

  function setVisiblePanel(panelId) {
    const app = $("driverAppView");
    if (!app) return;
    const target = panelId || "driverPanelActive";
    app.dataset.simplePanel = target;

    qsa(".panel[id^='driverPanel']", app).forEach((panel) => {
      const visible = panel.id === target;
      panel.classList.toggle("driver-simple-visible", visible);
      panel.classList.toggle("driver-simple-hidden", !visible);
      panel.setAttribute("aria-hidden", visible ? "false" : "true");
    });

    qsa("#driverSimpleTabs button, #driverFieldNav button").forEach((btn) => {
      const btnTarget = btn.getAttribute("data-driver-target") || btn.dataset.panel;
      btn.classList.toggle("active", btnTarget === target);
    });

    updateCommandCenter();
  }

  function openPanel(panelId) {
    const id = panelId || "driverPanelActive";
    setVisiblePanel(id);
    const panel = $(id);
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextPanelByStatus() {
    const body = (text($("driverActiveCallBox")) + " " + text($("driverStatusGuideTitle"))).toLowerCase();
    if (!hasActiveCall()) return { label: "Selecionar chamado", panel: "driverPanelCalls" };
    if (/transporte|deslocamento|a caminho|rota/.test(body)) return { label: "Abrir rota / GPS", panel: "driverPanelMap" };
    if (/entreg|finaliz|assin/.test(body)) return { label: "Abrir finalização", panel: "driverPanelProofs", proofStep: "entrega" };
    return { label: "Abrir provas da etapa", panel: "driverPanelProofs" };
  }

  function renderProofStageIntro() {
    const panel = $("driverPanelProofs");
    const wizard = $("driverProofWizard");
    if (!panel || !wizard) return;
    let intro = $("driverProofStageIntro");
    if (!intro) {
      intro = document.createElement("div");
      intro.id = "driverProofStageIntro";
      intro.className = "driver-proof-stage-intro";
      wizard.insertAdjacentElement("afterend", intro);
    }
    const key = currentProofStepKey();
    const help = STEP_HELP[key] || STEP_HELP.retirada;
    intro.innerHTML = `
      <span>Etapa atual</span>
      <strong>${help.title}</strong>
      <p>${help.action}</p>
      <small>${help.hint}</small>`;
  }

  function updateCommandCenter() {
    const box = $("driverSimpleCommandCenter");
    if (!box) return;
    const next = nextPanelByStatus();
    const active = hasActiveCall() ? text($("driverHeaderActiveCall")) || text($("driverActiveCallBox")) : "Nenhum chamado selecionado";
    const missingText = text($("driverProofMissingBox"));
    const gpsText = text($("driverLocationStatus"));

    box.innerHTML = `
      <article class="driver-simple-main-card">
        <span>Chamado atual</span>
        <strong>${active.slice(0, 140)}</strong>
        <small>${missingText ? "Pendências: " + missingText.slice(0, 120) : "Sem pendência visível nesta tela."}</small>
      </article>
      <div class="driver-simple-action-grid">
        <button class="btn good driver-simple-big" id="driverSimpleNextBtn" type="button">${next.label}</button>
        <button class="btn primary" data-driver-shortcut="driverPanelProofs" type="button">Provas / Fotos</button>
        <button class="btn" data-driver-shortcut="driverPanelMap" type="button">Rota / GPS</button>
        <button class="btn" data-driver-shortcut="driverPanelExpense" type="button">Despesa</button>
      </div>
      <div class="driver-simple-note">${gpsText ? gpsText.slice(0, 160) : "GPS: aguardando permissão/configuração."}</div>`;

    $("driverSimpleNextBtn")?.addEventListener("click", () => openPanel(next.panel));
    qsa("[data-driver-shortcut]", box).forEach((btn) => btn.addEventListener("click", () => openPanel(btn.dataset.driverShortcut)));
    renderProofStageIntro();
  }

  function installCommandCenter() {
    if ($("driverSimpleShell")) return;
    const grid = document.querySelector("#driverAppView main .grid");
    if (!grid) return;
    const shell = document.createElement("section");
    shell.id = "driverSimpleShell";
    shell.className = "panel col-12 driver-simple-shell no-collapse";
    shell.innerHTML = `
      <div class="driver-simple-head">
        <div>
          <span class="driver-eyebrow">Modo motorista 20/10</span>
          <h2>O que fazer agora</h2>
          <p class="muted small">Uma tela por vez. O sistema continua completo por trás, mas o motorista não precisa enxergar tudo ao mesmo tempo.</p>
        </div>
        <button class="btn" id="driverSimpleShowAllBtn" type="button">Ver módulos técnicos</button>
      </div>
      <div id="driverSimpleCommandCenter"></div>
      <nav class="driver-simple-tabs" id="driverSimpleTabs" aria-label="Fluxo rápido do motorista">
        <button class="active" data-driver-target="driverPanelActive" type="button">Atendimento</button>
        <button data-driver-target="driverPanelCalls" type="button">Chamados</button>
        <button data-driver-target="driverPanelMap" type="button">Rota</button>
        <button data-driver-target="driverPanelProofs" type="button">Provas</button>
        <button data-driver-target="driverPanelExpense" type="button">Despesas</button>
      </nav>`;
    grid.insertBefore(shell, grid.firstElementChild);

    $("driverSimpleShowAllBtn")?.addEventListener("click", () => {
      document.body.classList.toggle("driver-show-all");
      $("driverSimpleShowAllBtn").textContent = document.body.classList.contains("driver-show-all") ? "Voltar ao modo simples" : "Ver módulos técnicos";
    });

    qsa("#driverSimpleTabs button, #driverFieldNav button").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const target = btn.getAttribute("data-driver-target") || btn.dataset.panel;
        if (target) {
          ev.preventDefault();
          openPanel(target);
        }
      });
    });

    openPanel("driverPanelActive");
    updateCommandCenter();
  }

  function installProofStageWatcher() {
    document.addEventListener("click", (ev) => {
      const tab = ev.target && ev.target.closest && ev.target.closest("#proofWizardTabs .proof-wizard-tab");
      if (tab) setTimeout(() => { renderProofStageIntro(); updateCommandCenter(); }, 80);
    }, true);
  }

  function observeLightly() {
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => { scheduled = false; updateCommandCenter(); }, 350);
    };
    ["driverActiveCallBox", "driverHeaderActiveCall", "driverLocationStatus", "driverProofMissingBox", "driverStatusGuideTitle", "proofWizardTitle"].forEach((id) => {
      const el = $(id);
      if (el && window.MutationObserver) new MutationObserver(schedule).observe(el, { childList: true, subtree: true, characterData: true });
    });
  }

  function init() {
    document.body.classList.add("driver-simple-mode");
    installCommandCenter();
    installProofStageWatcher();
    observeLightly();
    console.log("JM motorista UX simples", VERSION);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
