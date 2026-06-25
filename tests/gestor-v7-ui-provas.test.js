"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
const motorista = fs.readFileSync(path.join(root, "js/motorista.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const jm = fs.readFileSync(path.join(root, "jm.html"), "utf8");

assert.ok(app.includes("canEditOperationalCall"), "permissão operacional de edição ausente");
assert.ok(app.includes("Editar chamado"), "botão editar chamado ausente");
assert.ok(app.includes("callVehicleSummary"), "resumo de veículo ausente");
assert.ok(app.includes("callClientSummary"), "resumo de cliente ausente");
assert.ok(app.includes("callPaymentSummary"), "resumo de pagamento ausente");
assert.ok(app.includes("proofPhotos(call)"), "gestor não consulta proofPhotos no painel");
assert.ok(app.includes("proofAudios(call)"), "gestor não consulta proofAudios no painel");
assert.ok(app.includes("customerSignature"), "gestor não consulta assinatura no painel");

assert.ok(motorista.includes("proofPhotos: proofPhotosMerged"), "motorista não persiste proofPhotos no chamado");
assert.ok(motorista.includes("proofAudios: proofAudiosMerged"), "motorista não persiste proofAudios no chamado");
assert.ok(motorista.includes("customerSignature"), "motorista não persiste assinatura no chamado");
assert.ok(motorista.includes('db.collection("calls").doc(callId).set(callUpdates, { merge: true })'), "motorista não salva provas em calls/{id}");

assert.ok(css.includes("JM V7"), "CSS V7 responsivo ausente");
assert.ok(css.includes("grid-template-columns: repeat(auto-fit"), "cards responsivos ausentes");
assert.ok(css.includes("overflow-wrap:anywhere"), "quebra de texto responsiva ausente");
assert.ok(jm.includes("jm-fluxo-operacional-v26-cache-refresh"), "jm.html sem versão V7");

console.log("PASS gestor-v7-ui-provas.test.js");
