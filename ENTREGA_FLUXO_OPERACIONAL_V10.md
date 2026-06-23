# JM Fluxo Operacional V10 — correção cirúrgica de responsividade da aba Chamados

Base: `GuinchoJM-main (1).zip` enviado pelo usuário.

## Escopo
Correção focada na aba Chamados do painel gestor, sem alterar regras Firebase/RTDB, motorista, GPS, provas, assinatura, financeiro, cliente ou superadmin.

## Corrigido
- A aba Chamados deixa de depender de colunas rígidas em telas/zoom críticos.
- Em 100%, 110%, 120% e telas menores, os blocos empilham automaticamente.
- Cards minimizados preservam os detalhes essenciais do chamado.
- Botões dos chamados quebram linha e não somem.
- Textos longos de rota, cliente, placa e seguradora quebram linha em vez de cortar.
- Painel do chamado continua exibindo operação, cliente, veículo, pagamento, rota, checklist, fotos, áudios, assinatura, financeiro, linha do tempo e link público.
- Assinatura no painel/relatório ganha contraste visual maior.

## Arquivos alterados
- `css/style.css`
- `jm.html`
- `index.html`
- `motorista.html`
- `relatorio.html`
- `superadmin.html`
- `cliente-chamado.html`
- `formulario.html`
- `service-worker.js`
- `version.json`
- `tests/run-all.js`
- `tests/responsive-v10.test.js`

## Observação
Esta entrega preserva fluxo e dados. A mudança principal é apresentação responsiva e versionamento/cache V10.
