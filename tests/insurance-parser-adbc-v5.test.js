"use strict";
const parser = require("../js/insurance-parser.js");
function assert(cond, msg){ if(!cond){ console.error("FAIL:", msg); process.exit(1); } }
const text = `A/D - Base:
Rua Doutor Alceu de Assis, 660 - Jardim Maria Lucia, São José do Rio Preto - SP, Brasil
B - Local Ocorrência:
SOS Balanguinha Oficina de Caminhões - R. Francisco Raya Madrid, 465 - Conj. Polo Comercial e Industrial Prof. Giordano Mestrinelli, Catanduva - SP, 15803-305, Brasil
C - Destino:
Retífica São Paulo - R. Dr. Coutinho Cavalcante, 306 - Jardim Alto Alegre, São José do Rio Preto - SP, 15054-300, Brasil
Distância Total: 128.2 KM`;
const out = parser.parse(text);
assert(out.routeFormat === "ADBC_BASE_ORIGEM_DESTINO", "deve reconhecer formato A/D-B-C");
assert(out.base && /Alceu de Assis/.test(out.base.searchAddress || out.base.address || ""), "base deve ser separada");
assert(out.origin && /Balanguinha|Francisco Raya Madrid|Catanduva/.test(out.origin.searchAddress || out.origin.address || ""), "origem/ocorrência deve ser B");
assert(out.destination && /Retífica|Retifica|Coutinho Cavalcante/.test(out.destination.searchAddress || out.destination.address || ""), "destino deve ser C");
assert(Math.abs(Number(out.totalRouteKm) - 128.2) < 0.01, "distância total deve ser 128.2");
assert(!/Alceu de Assis/.test(out.destination.searchAddress || ""), "destino não pode conter base");
console.log("insurance-parser-adbc-v5 ok");
