# JM Guinchos — V13 Motorista Sequencial Automático

Base usada: `GuinchoJM-main (2).zip`.

## Objetivo
Melhorar a UIX do motorista no celular sem remover fluxos, provas, assinatura, GPS, despesas, Cloudinary, gestor, financeiro ou relatórios.

## O que mudou
- Motorista passa a operar por uma ação principal por vez.
- Botão grande conduz a próxima etapa.
- Ao marcar etapa como OK, a interface salva rascunho e aponta a próxima pendência/etapa.
- Provas e assinatura continuam obrigatórias; se não houver evidência, o motorista deve justificar.
- Foto por câmera e galeria foram preservadas.
- Despesa rápida continua acessível.
- Módulos técnicos continuam disponíveis no botão “Módulos técnicos”.

## Arquivos principais
- `motorista.html`
- `js/motorista-simple-flow.js`
- `css/style.css`
- `service-worker.js`
- `version.json`

## Validação local
- `node --check js/motorista-simple-flow.js`
- `node --check js/motorista.js`
- `node --check js/app.js`
- `node tests/run-all.js`

Resultado: `ALL TESTS PASSED`.

## Observação
Não alterei regras Firebase/RTDB. A validação real de upload, assinatura e visualização pelo gestor ainda deve ser feita no ambiente publicado com motorista e gestor logados.
