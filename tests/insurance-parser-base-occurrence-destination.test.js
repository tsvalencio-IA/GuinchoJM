const assert = require('assert');
const parser = require('../js/insurance-parser.js');

const sample = `A/D - Base:
Rua Doutor Alceu de Assis, 660 - Jardim Maria Lucia, São José do Rio Preto - SP, Brasil
B - Local Ocorrência:
SOS Balanguinha Oficina de Caminhões - R. Francisco Raya Madrid, 465 - Conj. Polo Comercial e Industrial Prof. Giordano Mestrinelli, Catanduva - SP, 15803-305, Brasil
C - Destino:
Retífica São Paulo - R. Dr. Coutinho Cavalcante, 306 - Jardim Alto Alegre, São José do Rio Preto - SP, 15054-300, Brasil
Distância Total: 128.2 KM`;

const result = parser.parse(sample);
assert.strictEqual(result.routeModel, 'base-occurrence-destination');
assert.ok(result.base.address.includes('Rua Doutor Alceu de Assis'), result.base.address);
assert.ok(result.origin.address.includes('Francisco Raya Madrid'), result.origin.address);
assert.ok(result.origin.address.includes('Catanduva'), result.origin.address);
assert.ok(result.destination.address.includes('Coutinho Cavalcante'), result.destination.address);
assert.ok(result.destination.address.includes('São José do Rio Preto') || result.destination.address.includes('Sao Jose do Rio Preto'), result.destination.address);
assert.strictEqual(result.totalRouteKm, 128.2);
assert.ok(!result.destination.address.includes('Francisco Raya Madrid'), 'Destino contaminado com origem');
console.log('insurance parser A/D Base, B Ocorrência, C Destino OK');
