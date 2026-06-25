# JM Guinchos — V25 Continuar Provas

## Correção
O teste real no F12 ficou com apenas uma falha crítica: `Continuar prova responde`.

A causa era o handler antigo do botão `CONTINUAR` usando função local dentro de `motorista.js`; isso fazia o teste não conseguir interceptar `saveProofDraft` pela API pública e, em alguns estados, o botão parecia não responder.

## Ajuste V25
- `CONTINUAR` agora é tratado também no `motorista-simple-flow.js` em captura.
- O clique chama `window.JM.motorista.saveProofDraft({ silent: true, validate: false })`.
- Depois avança a etapa com `window.JM.motorista.setProofWizardStep(...)`.
- Se não houver chamado ativo, abre `Meus chamados`.
- Se houver erro/pendência indicada, leva para a pendência.

## Arquivos alterados
- `js/motorista-simple-flow.js`
- `tests/run-all.js`
- `tests/motorista-v25-continuar-provas.test.js`
- `ENTREGA_FLUXO_OPERACIONAL_V25.md`
