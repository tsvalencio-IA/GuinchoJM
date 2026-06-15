(function () {
  "use strict";

  const VERSION = "jm-fluxo-simplificado-sem-remover-logicas-v4";
  const $ = (id) => document.getElementById(id);
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function text(el) {
    return String(el && el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function clickIfEnabled(id) {
    const el = $(id);
    if (el && !el.disabled) {
      el.click();
      return true;
    }
    return false;
  }

  function setVisiblePanel(panelId) {
    const app = $("driverAppView");
    if (!app) return;
    app.dataset.simplePanel = panelId || "driverPanelActive";
    qsa(".panel[id^='driverPanel']", app).forEach((panel) => {
      const keep = panel.id === "driverPanelActive" || panel.id === panelId;
      panel.classList.toggle("driver-simple-visible", keep);
      panel.classList.toggle("driver-simple-hidden", !keep);
    });
    qsa("#driverSimpleTabs button, #driverFieldNav button").forEach((btn) => {
      const target = btn.getAttribute("data-driver-target") || btn.dataset.panel;
      btn.classList.toggle("active", target === panelId || (!panelId && target === "driverPanelActive"));
    });
  }

  function openPanel(panelId) {
    setVisiblePanel(panelId);
    const panel = $(panelId) || $("driverPanelActive");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextActionLabel() {
    const active = $("driverActiveCallBox");
    const status = text(active).toLowerCase();
    const guide = text($("driverStatusGuideTitle")).toLowerCase();
    const combined = status + " " + guide;
    if (/nenhum atendimento|selecione/.test(combined)) return "Selecionar atendimento";
    if (/a caminho|deslocamento|rota/.test(combined)) return "Abrir rota / GPS";
    if (/local|retirada|carregar|carregado|entrega|finaliza/.test(combined)) return "Enviar provas da etapa";
    return "Próxima ação";
  }

  function updateCommandCenter() {
    const box = $("driverSimpleCommandCenter");
    if (!box) return;
    const label = nextActionLabel();
    const activeText = text($("driverHeaderActiveCall")) || text($("driverActiveCallBox"));
    const missing = text($("driverProofMissingBox"));
    const gps = text($("driverLocationStatus"));
    const proofOk = missing ? "Pendências: " + missing.slice(0, 130) : "Provas: acompanhe por etapa";

    box.innerHTML = `
      <div class="driver-simple-card driver-simple-primary">
        <span>Chamado atual</span>
        <strong>${activeText && !/nenhum/i.test(activeText) ? activeText.slice(0, 96) : "Selecione um atendimento"}</strong>
      </div>
      <div class="driver-simple-grid-actions">
        <button class="btn good driver-simple-big" id="driverSimpleNextBtn" type="button">${label}</button>
        <button class="btn primary" id="driverSimpleProofBtn" type="button">Provas / Fotos</button>
        <button class="btn" id="driverSimpleExpenseBtn" type="button">Despesa rápida</button>
        <button class="btn" id="driverSimpleGpsBtn" type="button">Rota / GPS</button>
      </div>
      <div class="driver-simple-status">
        <span>${proofOk}</span>
        <span>${gps ? gps.slice(0, 110) : "GPS: aguardando"}</span>
      </div>`;

    $("driverSimpleNextBtn")?.addEventListener("click", () => {
      if (/selecionar/i.test(label)) return openPanel("driverPanelCalls");
      if (/rota|gps/i.test(label)) return openPanel("driverPanelMap");
      return openPanel("driverPanelProofs");
    });
    $("driverSimpleProofBtn")?.addEventListener("click", () => openPanel("driverPanelProofs"));
    $("driverSimpleExpenseBtn")?.addEventListener("click", () => openPanel("driverPanelExpense"));
    $("driverSimpleGpsBtn")?.addEventListener("click", () => openPanel("driverPanelMap"));
  }

  function installCommandCenter() {
    if ($("driverSimpleShell")) return;
    const active = $("driverPanelActive");
    if (!active) return;
    const shell = document.createElement("section");
    shell.id = "driverSimpleShell";
    shell.className = "panel col-12 driver-simple-shell no-collapse";
    shell.innerHTML = `
      <div class="driver-simple-head">
        <div>
          <span class="driver-eyebrow">Modo motorista simples</span>
          <h2>O que fazer agora</h2>
          <p class="muted small">Tela guiada para rua: chamado, próxima ação, rota, provas e despesas. As funções antigas continuam preservadas nos módulos abaixo.</p>
        </div>
        <button class="btn" id="driverSimpleShowAllBtn" type="button">Ver tudo</button>
      </div>
      <div id="driverSimpleCommandCenter"></div>
      <div class="driver-simple-tabs" id="driverSimpleTabs">
        <button class="active" data-driver-target="driverPanelActive" type="button">Atendimento</button>
        <button data-driver-target="driverPanelCalls" type="button">Chamados</button>
        <button data-driver-target="driverPanelMap" type="button">Rota</button>
        <button data-driver-target="driverPanelProofs" type="button">Provas</button>
        <button data-driver-target="driverPanelExpense" type="button">Despesas</button>
      </div>`;
    active.parentNode.insertBefore(shell, active);

    $("driverSimpleShowAllBtn")?.addEventListener("click", () => {
      document.body.classList.toggle("driver-show-all");
      $("driverSimpleShowAllBtn").textContent = document.body.classList.contains("driver-show-all") ? "Modo simples" : "Ver tudo";
    });

    qsa("#driverSimpleTabs button, #driverFieldNav button").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        const target = btn.getAttribute("data-driver-target");
        if (target) {
          ev.preventDefault();
          openPanel(target);
        }
      });
    });

    qsa("#driverPanelProofs details").forEach((d, i) => { d.open = i < 1; });
    setVisiblePanel("driverPanelActive");
    updateCommandCenter();
  }

  function observeLightly() {
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => { scheduled = false; updateCommandCenter(); }, 400);
    };
    const targets = ["driverActiveCallBox", "driverHeaderActiveCall", "driverLocationStatus", "driverProofMissingBox", "driverStatusGuideTitle"];
    targets.forEach((id) => {
      const el = $(id);
      if (el && window.MutationObserver) {
        new MutationObserver(schedule).observe(el, { childList: true, subtree: true, characterData: true });
      }
    });
    document.addEventListener("click", (ev) => {
      if (ev.target && ev.target.closest && ev.target.closest("#driverApplyStatusBtn,#driverStartLocationBtn,#driverStopLocationBtn,#driverSubmitProofBtn,#driverExpenseSubmitBtn")) {
        schedule();
      }
    }, true);
  }

  function init() {
    document.body.classList.add("driver-simple-mode");
    installCommandCenter();
    observeLightly();
    console.log("JM motorista modo simples", VERSION);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
