"use strict";
const { spawnSync } = require("child_process");
const path = require("path");
const tests = ["insurance-parser.test.js","geocode-brasil.test.js","version-cache.test.js","phase1-motorista.test.js","phase2-motorista.test.js","final-phases.test.js","login-gestor.test.js","login-ui-responsiveness.test.js","motorista-signature-header.test.js","motorista-pendencias-v32-7-7.test.js","central-cards-v5.test.js","insurance-parser-adbc-v5.test.js","commercial-v6.test.js","gestor-v7-ui-provas.test.js", "responsive-v10.test.js", "motorista-sequencial-v13.test.js", "motorista-justificativa-fotos-v14.test.js", "motorista-fotos-salvamento-v15.test.js", "motorista-modo-rua-v16.test.js", "motorista-acessos-v17.test.js", "motorista-provas-v18.test.js", "motorista-popular-v19.test.js", "motorista-pendencias-notificacoes-v20.test.js", "motorista-pendencias-v21.test.js", "motorista-v22-theme-pendencias.test.js", "motorista-finalizados-v23.test.js", "motorista-v24-acoes-finalizados.test.js", "motorista-v25-continuar-provas.test.js"
];
const fs = require("fs");
for (const test of tests) {
  const full = path.join(__dirname, test);
  if (!fs.existsSync(full)) {
    console.warn("SKIP missing test", test);
    continue;
  }
  const result = spawnSync(process.execPath,[full],{stdio:"inherit"});
  if (result.status !== 0) process.exit(result.status || 1);
}
  require('./financeiro-rota-manual-hotfix.test.js');
  require('./motorista-fotos-camera-galeria-v11.test.js');
  require('./motorista-uix-v12.test.js');
console.log("ALL TESTS PASSED");


