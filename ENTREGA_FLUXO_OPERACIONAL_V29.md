# JM Guinchos — V29 Motorista Cache Clean

Escopo: somente motorista/cache do PWA. Não altera `jm.html`, `index.html`, `superadmin.html`, `relatorio.html` ou `cliente-chamado.html`.

Correções:
- Limpeza de entradas antigas `v21` a `v28` dentro do CacheStorage atual.
- Service Worker deixa de gravar URLs com `?v=` antigo dentro do cache novo.
- Mensagem `PURGE_OLD_CACHES` disponível para limpar entradas antigas.
- Versionamento do motorista atualizado para `jm-fluxo-operacional-v29-motorista-cache-clean`.

Arquivos alterados:
- motorista.html
- css/style.css
- js/motorista.js
- js/motorista-simple-flow.js
- js/motorista-final-ux.js
- service-worker.js
- version.json
- ENTREGA_FLUXO_OPERACIONAL_V29.md
