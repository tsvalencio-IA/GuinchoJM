# JM Guinchos — V20 Motorista: pendências diretas e avisos

Base: V19 Motorista Popular + V18 Provas Inteligentes.

## Corrigido

- No Modo Motorista Popular, o indicador `Faltam X` virou botão clicável: ao tocar, o sistema abre diretamente a próxima pendência real.
- Pendências de fotos continuam abrindo o fluxo correto de foto/galeria/sem foto.
- Pendências de assinatura continuam abrindo a assinatura ou justificativa.
- Pendências de campos técnicos abrem diretamente o campo correspondente dentro das provas.
- Corrigido texto `[object Object] → [object Object]` no título da rota quando origem/destino vierem como objeto.
- Adicionado menu `Avisos` para solicitar permissão de notificação de novo chamado.
- Quando um novo chamado é atribuído ao motorista com o painel/app aberto ou em segundo plano, o sistema emite aviso do navegador/PWA.
- O Service Worker trata clique na notificação e abre/foca o painel motorista.

## Preservado

- Fotos, galeria, retry/remover prova com falha.
- Cloudinary.
- GPS e RTDB.
- Assinatura e justificativa.
- Despesa rápida.
- Modo técnico completo em `Detalhes`.
- Gestor/JM, financeiro, relatórios, portal cliente.
- Firebase Rules e RTDB Rules.

## Observação técnica sobre avisos

Notificações fora da tela dependem da permissão do navegador/PWA e funcionam quando o app/página está aberto ou em segundo plano. Push com navegador totalmente fechado exige backend de Push/FCM, que não foi adicionado nesta entrega para não alterar arquitetura nem regras.

## Testes locais

- `node --check js/motorista-simple-flow.js`
- `node --check js/motorista.js`
- `node --check js/app.js`
- `node --check service-worker.js`
- `node tests/run-all.js`

Resultado: `ALL TESTS PASSED`.
