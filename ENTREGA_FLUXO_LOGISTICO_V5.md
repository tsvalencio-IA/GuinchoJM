# JM Guinchos — V5 Fluxo Logístico

## Objetivo
Simplificar as telas sem simplificar os fluxos. A V5 organiza o uso real para gestor, motorista e cliente, mantendo as lógicas existentes.

## Alterações principais
- Aba Chamados do gestor convertida em fila operacional por cards.
- Vários chamados permanecem visíveis ao mesmo tempo.
- Cada chamado pode ser aberto, minimizado ou reaberto sem esconder os demais.
- Painel do chamado continua existindo para rota, provas, assinatura, financeiro, chat e relatório.
- Parser da IA reconhece o formato: A/D Base, B Local Ocorrência, C Destino e Distância Total.
- Versionamento/cache atualizado para `jm-fluxo-logistico-v5-central-cards`.

## Preservado
- Financeiro manual.
- Rota, KM, pedágio e sugestão sem aplicação automática invisível.
- GPS, Tracker RAFA, motorista, provas, assinatura, despesas, cliente público, relatórios e superadmin.
- Firebase Rules e RTDB Rules não foram alteradas.

## Arquivos principais alterados
- `jm.html`
- `js/app.js`
- `js/insurance-parser.js`
- `css/style.css`
- `service-worker.js`
- `version.json`
- `package.json`
- `tests/central-cards-v5.test.js`
- `tests/insurance-parser-adbc-v5.test.js`
