# ENTREGA V7 — Gestor Responsivo, Painel do Chamado Completo e Provas Preservadas

Base usada: GuinchoJM-main.zip enviado pelo usuário nesta conversa.

Escopo cirúrgico:
- Não simplificar fluxos internos.
- Não remover GPS, provas, assinatura, despesas, financeiro, relatórios, cliente, motorista ou superadmin.
- Corrigir UI/UX do gestor para zoom/telas diferentes.
- Recolocar/realçar edição de chamado para perfis operacionais permitidos.
- Completar painel do chamado com cliente, veículo, rota, pagamento, provas e financeiro.
- Preservar salvamento de fotos/áudios/assinatura pelo motorista e exibição pelo gestor.

Arquivos principais alterados:
- js/app.js
- css/style.css
- jm.html
- motorista.html
- index.html
- superadmin.html
- relatorio.html
- cliente-chamado.html
- formulario.html
- service-worker.js
- version.json
- package.json
- tests/* versionamento
- tests/gestor-v7-ui-provas.test.js

Validações locais:
- npm run check:js
- node tests/run-all.js
- node --check js/app.js
- node --check js/motorista.js

Observação:
A validação real de Cloudinary/Firebase exige teste autenticado em produção com motorista enviando fotos e gestor abrindo o painel do chamado. A estrutura está preservada: motorista grava proofPhotos/proofAudios/customerSignature em calls/{id}; gestor lê proofPhotos/proofAudios/customerSignature no painel do chamado.
