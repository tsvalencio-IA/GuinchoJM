# JM Guinchos — V12 Motorista UX 20/10

Base: V11 fotos câmera/galeria.

## Objetivo
Simplificar o painel do motorista sem remover nenhuma lógica operacional. O motorista passa a trabalhar com uma tela por vez: Atendimento, Chamados, Rota/GPS, Provas e Despesas.

## Alterações principais
- `motorista.html` agora carrega `js/motorista-simple-flow.js`.
- `js/motorista-simple-flow.js` refeito como camada de UX 20/10.
- `css/style.css` recebeu regras para esconder módulos fora da etapa ativa, sem apagar conteúdo do DOM.
- Etapa de provas ganhou orientação clara por fase, incluindo Transporte, para evitar mistura de campos.
- Botão “Ver módulos técnicos” permite acessar o fluxo completo original quando necessário.
- Versionamento/cache atualizado para `jm-fluxo-operacional-v12-motorista-uix-20-10`.

## Preservado
- IDs originais.
- Salvamento de provas.
- Upload Cloudinary.
- Assinatura.
- GPS.
- Despesas.
- Financeiro.
- Gestor/JM.
- Firebase Rules e RTDB Rules.

## Validação local
- `node --check js/motorista.js`
- `node --check js/motorista-simple-flow.js`
- `node --check js/app.js`
- `node tests/run-all.js`

Resultado local: `ALL TESTS PASSED`.

## Observação
Esta versão altera a experiência visual do motorista, não a regra de negócio. O teste final precisa ser feito em celular real com motorista: selecionar chamado, abrir Transporte, alternar Provas/Rota/Despesas, enviar foto, assinar e verificar no gestor.
