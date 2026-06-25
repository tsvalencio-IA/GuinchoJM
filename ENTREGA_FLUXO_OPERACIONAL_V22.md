# JM Guinchos — Fluxo Operacional V22

## Foco desta versão
Motorista mais simples, mais discreto e mais confiável no uso em campo.

## Ajustes feitos
1. **Botão modo claro/escuro redesenhado**
   - saiu do rodapé
   - virou botão discreto com ícone
   - fica no canto superior direito
   - não deve mais sobrepor os botões principais do motorista
   - alterna entre ícone de sol/lua com rótulo acessível

2. **Pendências mais diretas**
   - clique em pendência tenta abrir diretamente o alvo correto
   - quando o `target` original não existir, o sistema usa mapeamento de fallback por etapa/campo
   - botão **ABRIR** reaproveita a mesma navegação direta das pendências
   - reforço de abertura da assinatura, aceite textual, responsável/documento e campos de inspeção

3. **Tema com contraste reforçado**
   - textos auxiliares no modo claro mais escuros
   - placeholders ajustados
   - navegação inferior em modo claro com leitura mais forte

4. **Rota mais robusta**
   - tratamento melhor para objetos de endereço para evitar `[object Object]`

5. **Script de auditoria para F12**
   - arquivo: `tests/motorista-devtools-audit-v22.js`
   - uso: abrir `motorista.html`, colar no Console do navegador e rodar `JMDriverAuditV22.run()`
   - verifica existência de botões, navegação, pendências, alternância de tema, contraste e sobreposição visual do botão de tema

6. **Teste automatizado V22**
   - arquivo: `tests/motorista-v22-theme-pendencias.test.js`
   - incluído no `tests/run-all.js`

## Arquivos alterados
- `motorista.html`
- `css/style.css`
- `js/utils.js`
- `js/motorista-simple-flow.js`
- `tests/run-all.js`
- `tests/motorista-v22-theme-pendencias.test.js`
- `tests/motorista-devtools-audit-v22.js`
- `ENTREGA_FLUXO_OPERACIONAL_V22.md`
