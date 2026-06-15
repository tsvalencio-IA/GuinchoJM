# JM Guinchos — V5 Fluxo Logístico

Sistema operacional para guincho, socorro, munck e remoção.

## Entradas principais
- `index.html`: entrada/login.
- `jm.html`: gestor/central operacional.
- `motorista.html`: painel motorista.
- `cliente-chamado.html`: acompanhamento público do cliente.
- `superadmin.html`: configurações e administração.
- `relatorio.html`: relatório/laudo.

## V5
Esta versão melhora a UX logística sem remover fluxos: chamados em cards, minimizar/reabrir cards, painel de chamado preservado e parser de acionamentos A/D Base / B Ocorrência / C Destino.

## Configuração
Preencha `js/config.firebase.js` com os dados reais do Firebase antes de publicar.

## Testes locais
```bash
npm run check:js
node tests/run-all.js
```
