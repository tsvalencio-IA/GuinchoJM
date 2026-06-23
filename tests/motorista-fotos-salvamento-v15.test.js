const fs = require('fs');
const path = require('path');
const root = process.cwd();
const motorista = fs.readFileSync(path.join(root, 'js/motorista.js'), 'utf8');
function assert(cond, msg){ if(!cond){ console.error(msg); process.exit(1); } }
assert(motorista.includes('const driverImageFallbackFiles = {}'), 'deve manter fallback interno para fotos de galeria');
assert(motorista.includes('function inputFiles(input)'), 'deve ler fotos pelo helper inputFiles');
assert(motorista.includes('!hasPhotoJustificationNow && !selectedPhotos.length'), 'não pode bloquear upload parcial de fotos quando há foto selecionada');
assert(motorista.includes('clearInputFiles(input)'), 'deve limpar input e fallback após salvar');
console.log('motorista-fotos-salvamento-v15.test.js OK');
