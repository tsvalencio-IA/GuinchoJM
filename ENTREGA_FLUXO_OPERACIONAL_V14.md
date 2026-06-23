# JM Guinchos — V14 Motorista com Justificativa Única de Fotos

## Objetivo
Simplificar o trabalho do motorista em campo sem remover provas, assinatura, GPS, despesas, Cloudinary, financeiro, gestor ou relatórios.

## Correção principal
Quando faltarem fotos/evidências, o motorista não precisa justificar uma por uma. Agora existe uma justificativa única para fotos/evidências:

- o sistema agrupa todas as fotos faltantes em uma única pendência;
- o botão do fluxo simples mostra “JUSTIFICAR FOTOS UMA VEZ”;
- a justificativa fica salva no `proofChecklist.photoJustification` e também em `proofPhotoJustification`;
- se não houver foto, a justificativa única desbloqueia o fluxo de provas;
- assinatura continua obrigatória ou precisa de justificativa própria;
- provas reais continuam sendo salvas normalmente quando enviadas.

## Arquivos de lógica alterados
- `motorista.html`
- `js/motorista.js`
- `js/motorista-simple-flow.js`
- `css/style.css`

## Arquivos de versionamento/cache
- `service-worker.js`
- `version.json`
- HTMLs principais com query string V14

## Não alterado
- Firebase Rules
- RTDB Rules
- Cloudinary
- financeiro do gestor
- relatórios/laudos
- portal cliente
- fluxo original de upload

## Testes executados localmente
```text
node --check js/motorista.js
node --check js/motorista-simple-flow.js
node --check js/app.js
node tests/run-all.js
ALL TESTS PASSED
```

## Validação real recomendada
No celular do motorista: abrir chamado, avançar até fotos, tocar em “JUSTIFICAR FOTOS UMA VEZ”, escrever “Não bati fotos.”, salvar, conferir no gestor se a justificativa aparece junto ao dossiê/provas do chamado.
