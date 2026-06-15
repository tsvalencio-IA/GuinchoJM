"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "style.css"), "utf8");
function assert(cond, msg){ if(!cond){ console.error("FAIL:", msg); process.exit(1); } }
assert(app.includes("function renderCallCard"), "renderCallCard precisa existir");
assert(app.includes("toggleCallCard"), "toggleCallCard precisa existir");
assert(app.includes("collapseAllCallCards"), "collapseAllCallCards precisa existir");
assert(app.includes("expandAllCallCards"), "expandAllCallCards precisa existir");
assert(app.includes("Fila operacional"), "fila operacional precisa aparecer na UI");
assert(app.includes("Abrir um chamado não oculta os demais"), "UI deve explicitar chamada multi-card");
assert(css.includes(".call-card") && css.includes(".call-board-v5"), "CSS dos cards V5 ausente");
assert(app.includes("JM.app.toggleCallCard"), "botão de card deve chamar toggleCallCard");
console.log("central-cards-v5 ok");
