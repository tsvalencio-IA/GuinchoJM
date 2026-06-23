"use strict";
const { spawnSync } = require("child_process");
const path = require("path");
const tests = ["insurance-parser.test.js","geocode-brasil.test.js","version-cache.test.js","phase1-motorista.test.js","phase2-motorista.test.js","final-phases.test.js","login-gestor.test.js","login-ui-responsiveness.test.js","motorista-signature-header.test.js","motorista-pendencias-v32-7-7.test.js","central-cards-v5.test.js","insurance-parser-adbc-v5.test.js","commercial-v6.test.js","gestor-v7-ui-provas.test.js", "responsive-v10.test.js", "motorista-sequencial-v13.test.js", "motorista-justificativa-fotos-v14.test.js"
];
for (const test of tests) {
  const result = spawnSync(process.execPath,[path.join(__dirname,test)],{stdio:"inherit"});
  if (result.status !== 0) process.exit(result.status || 1);
}
  require('./financeiro-rota-manual-hotfix.test.js');
  require('./motorista-fotos-camera-galeria-v11.test.js');
  require('./motorista-uix-v12.test.js');
console.log("ALL TESTS PASSED");

