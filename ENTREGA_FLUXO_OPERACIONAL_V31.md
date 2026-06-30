# JM Guinchos — V31 Motorista Cloudinary Real Flow

Base usada: ZIP atual do GitHub enviado pelo usuário (`GuinchoJM-main (2)(1).zip`).

## Diagnóstico real

O Cloudinary estava configurado e funcionando. O problema estava no fluxo do motorista:

- `ENVIAR PROVAS` fazia upload para Cloudinary, mas ficava escondido até etapa final.
- `SALVAR` chamava `saveProofDraft()`, que só grava rascunho/checklist no Firestore.
- `CONTINUAR` também chamava `saveProofDraft()`, então arquivo selecionado podia ficar só na tela e não ir para Cloudinary.
- O seletor "Escolher da galeria" usa um input dinâmico. Em alguns navegadores, copiar os arquivos para o input principal depende de `DataTransfer`; agora há sincronização/fallback antes de salvar/enviar.

## Correção aplicada

Correção cirúrgica no `js/motorista.js`:

1. Adicionado `syncDriverGalleryFallbacks()` para garantir que arquivos vindos da galeria sejam vinculados ao input real da prova.
2. Adicionado `selectedProofPhotoItems()` para detectar fotos pendentes usando input real + fallback interno.
3. Adicionado `hasPendingProofUploadEvidence()` para detectar foto, áudio ou assinatura pendente.
4. Adicionado `markCurrentProofStepReadyForUpload()` para marcar a etapa atual como OK quando há evidência selecionada e a etapa estava pendente.
5. Adicionado `saveProofAction()`:
   - Se há arquivo/assinatura pendente: chama o fluxo real de `submitProof()` e sobe para Cloudinary.
   - Se não há arquivo/assinatura: mantém `saveProofDraft()` como rascunho normal.
6. `SALVAR` agora chama `saveProofAction()`.
7. `CONTINUAR` agora chama `saveProofAction()` quando há evidência pendente.
8. O submit agora usa `selectedProofPhotoItems()` e `inputFiles()` para áudio, pegando arquivos nativos e fallback interno.
9. APIs expostas para diagnóstico:
   - `saveProofAction`
   - `activeCloudinaryConfig`
   - `hasPendingProofUploadEvidence`

## O que NÃO foi alterado

- Não alterado `jm.html`.
- Não alterado `index.html`.
- Não alterado `superadmin.html`.
- Não alterado `cliente-chamado.html`.
- Não alterado `relatorio.html`.
- Não alteradas regras Firebase.
- Não alterada configuração Cloudinary.
- Não removido fluxo antigo de submit; ele foi reaproveitado.

## Teste local executado

```bash
node --check js/motorista.js
node --check js/motorista-simple-flow.js
node --check js/motorista-final-ux.js
node --check service-worker.js
node tests/motorista-v31-cloudinary-real-flow.test.js
```

Resultado:

```text
motorista-v31-cloudinary-real-flow ok
```

Observação: `tests/run-all.js` da base ainda contém um teste antigo `version-cache.test.js` travado na V26 e por isso não é válido para esta entrega motorista-only.
