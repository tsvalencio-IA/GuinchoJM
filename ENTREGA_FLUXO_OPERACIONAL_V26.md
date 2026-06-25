# JM Guinchos — Fluxo Operacional V26 — Cache Refresh

## Problema identificado
O navegador ainda mostrava arquivos carregando com:

`?v=jm-fluxo-operacional-v21-pendencias-diretas`

Isso significava que o versionamento/cache bust continuava apontando para V21, mesmo após V23/V24/V25.

## Correção
- Atualizado versionamento global para `jm-fluxo-operacional-v26-cache-refresh`.
- Atualizados query strings de HTML, JS, CSS, manifest e service worker.
- Atualizado `service-worker.js` com novo `CACHE_NAME`.
- Atualizado `version.json`.
- Atualizados testes que validam versionamento/cache.

## O que NÃO foi alterado
- Firebase Rules
- RTDB Rules
- Cloudinary
- Financeiro
- Gestor
- Relatórios
- Salvamento de provas
- Lógica de chamados

## Como validar no navegador
No Console do motorista.html, rode:

```js
[...document.scripts].map(s => s.src).filter(Boolean).filter(s => s.includes('motorista'))
```

O correto é aparecer `jm-fluxo-operacional-v26-cache-refresh` nos arquivos do motorista.
