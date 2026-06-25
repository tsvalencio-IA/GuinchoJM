# JM Guinchos — Fluxo Operacional V23

## Correção aplicada
Esta versão corrige pontos encontrados no teste seguro do motorista.

## Problemas tratados
1. Motorista não tinha opção clara para ver chamados finalizados.
2. Ao abrir módulos depois de assinatura, a classe `driver-signature-only` podia continuar prendendo a UI e atrapalhar ações.
3. Modo claro apontou contraste ruim no topbar e no botão principal no teste seguro.
4. O teste marcava Faltam/ABRIR como falha mesmo quando não havia pendências calculadas.

## O que mudou
- Adicionado filtro no painel de chamados:
  - `Em andamento`
  - `Finalizados`
- Menu MAIS ganhou acesso a `Finalizados`.
- Chamado finalizado pode ser aberto em modo consulta.
- Chamado finalizado não libera edição, envio, GPS ou alteração de status.
- Ao abrir Chamados, Rota/GPS, Fotos/Provas, Despesa ou Detalhes, a UI sai do modo exclusivo de assinatura.
- Reforço de contraste no topbar e botão principal.
- Novo script F12: `tests/motorista-devtools-audit-v23.js`.
- Novo teste: `tests/motorista-finalizados-v23.test.js`.

## Não foi removido
- Fotos/provas
- Assinatura
- Justificativas
- Cloudinary
- GPS/RTDB
- Despesas
- Gestor/JM
- Financeiro
- Relatórios
- Firebase Rules
- RTDB Rules

## Testes locais
- `node --check js/motorista.js`
- `node --check js/motorista-simple-flow.js`
- `node --check tests/motorista-devtools-audit-v23.js`
- `node tests/run-all.js`

Resultado: `ALL TESTS PASSED`
