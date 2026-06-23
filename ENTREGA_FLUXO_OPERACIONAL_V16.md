# JM Guinchos — V16 Motorista Modo Rua

Base usada: `GuinchoJM-main (2).zip` com preservação do hotfix V15 de provas/fotos.

## Objetivo
Simplificar o painel do motorista sem remover fluxo operacional. O motorista deve ver uma ação por vez, com botão grande, pouca leitura e avanço automático.

## Alterações
- `js/motorista-simple-flow.js`: Modo Rua com próxima ação, foto/galeria/justificativa única, assinatura separada e despesa rápida.
- `css/style.css`: layout mobile/PC para Modo Rua, escondendo painéis técnicos quando não solicitados.
- `js/motorista.js`: preservado com hotfix V15 para salvamento de fotos/galeria.
- `motorista.html` e demais HTMLs: versionamento V16 para cache.
- `service-worker.js` e `version.json`: cache/versionamento V16.

## Preservado
GPS, rota, Cloudinary, fotos, galeria, assinatura, justificativas, despesas, financeiro, gestor, relatórios, portal e regras Firebase/RTDB.

## Regra operacional
- Foto ausente: uma justificativa cobre as fotos/evidências da etapa.
- Assinatura ausente: justificativa separada.
- Modo técnico continua disponível em `Detalhes`.

## Validações locais
- `node --check js/motorista-simple-flow.js`
- `node --check js/motorista.js`
- `node --check js/app.js`
- `node tests/run-all.js`

Resultado local: `ALL TESTS PASSED`.

## Observação honesta
Os testes locais validam sintaxe, estrutura e regras de UI. O teste final precisa ser feito no celular: abrir chamado, avançar etapas, enviar foto, justificar ausência, assinar/justificar e confirmar no gestor.
