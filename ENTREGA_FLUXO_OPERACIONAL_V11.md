# JM Fluxo Operacional V11 — fotos por câmera ou galeria no motorista

## Escopo
Correção cirúrgica no painel do motorista para permitir duas ações claras em todos os campos de imagem:

- **Tirar foto agora** usando câmera traseira quando o navegador permitir.
- **Escolher da galeria** usando imagens já salvas no aparelho.

## Preservado
- Mesmos IDs dos campos de upload.
- Mesmo fluxo de envio ao Cloudinary.
- Mesmo salvamento das provas no chamado.
- GPS, assinatura, despesas, financeiro, gestor, cliente, relatório e Firebase Rules não foram alterados.

## Observação técnica
Navegador/PWA não pode obrigar Android/iOS a salvar automaticamente a foto na galeria. A V11 adiciona link **Salvar no celular** após selecionar imagem, quando o navegador permitir.

## Arquivos alterados
- `motorista.html` somente versionamento/cache.
- `js/motorista.js`.
- `css/style.css`.
- `service-worker.js`.
- `version.json`.
- testes.
