# JM Guinchos — V8 Operacional Responsiva

Base usada: `GuinchoJM-main.zip` enviado pelo usuário.

## Correções principais

- Corrigida a responsividade real do painel gestor em zoom e telas diferentes.
- `content` deixou de ficar limitado/centralizado com grandes áreas vazias laterais.
- Aba Chamados agora empilha formulário/lista automaticamente em larguras críticas para evitar dados escondidos.
- Cards de chamados não escondem botões: ações quebram linha em grid responsivo.
- Painel do chamado ganhou botão **Editar chamado** no cabeçalho.
- Painel do chamado agora destaca Cliente/Seguradora, Veículo/Motorista, Rota operacional e Pagamento/Cobrança.
- Painel de provas preservado: fotos, áudios, checklist, assinatura, mapa de avarias e relatório continuam no dossiê.
- Assinatura no gestor preservada com reforço visual no preview.

## Preservado

- Motorista.
- GPS/Tracker.
- Provas/fotos/áudios.
- Assinatura.
- Financeiro.
- Cliente público.
- Superadmin.
- Relatório/PDF.
- Firebase Rules/RTDB Rules sem alteração.

## Testes locais executados

```text
npm run check:js
node tests/run-all.js
```

Resultado: todos passaram.

## Observação

Esta correção não simplifica o fluxo interno. Ela reorganiza a UI para não esconder informações nem botões quando o usuário muda zoom ou usa telas menores.
