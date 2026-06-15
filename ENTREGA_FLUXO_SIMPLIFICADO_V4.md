# Entrega V4 — Fluxo simplificado sem remover lógicas

## Alterações reais

### Motorista
- Adicionado `js/motorista-simple-flow.js`.
- Painel motorista passa a abrir em modo simples, com:
  - chamado atual;
  - próxima ação;
  - atalhos para provas, despesas e rota/GPS;
  - navegação por abas simples;
  - botão “Ver tudo” para acessar a tela completa quando necessário.
- Os formulários originais continuam existindo; a simplificação é visual/operacional, não remoção de lógica.

### IA Assistente / Parser
- `js/insurance-parser.js` agora entende o formato:
  - `A/D - Base:`
  - `B - Local Ocorrência:`
  - `C - Destino:`
  - `Distância Total: 128.2 KM`
- Base, ocorrência e destino são separados para evitar contaminação de endereço.

### Financeiro / Guincho
- Mantido fechamento manual/assistido.
- Não foi recriado cálculo automático confuso de guincho.
- Rota, KM e pedágio continuam como apoio operacional.

### Limpeza
- Removidos documentos antigos de entrega, manifestos antigos, listas antigas e scripts F12 antigos da raiz.
- Mantidos código, regras, testes e documentação resumida.

## Não alterado
- Firebase Rules.
- RTDB Rules.
- Cloudinary.
- Estrutura de coleções.
- Provas/assinatura/GPS/despesas no banco.

## Testes executados

```bash
npm run check:js
node tests/run-all.js
```
