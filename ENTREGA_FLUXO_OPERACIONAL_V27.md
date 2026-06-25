# JM Guinchos — V27 Motorista UX + Provas

Foco desta entrega: **somente fluxo do motorista**.

## Versão/cache

Versão ativa:

`jm-fluxo-operacional-v27-motorista-ux-provas`

## Correções implementadas

### 1. Contraste claro/escuro do motorista
- Reforço de contraste nos botões do card do motorista.
- Modo claro sem botão fluorescente/lavado.
- Modo escuro com texto legível em botões, atalhos e ações.
- Mantido botão de tema discreto no topo.

### 2. Assinatura recusada sem pendência burra
- Criadas opções rápidas de recusa:
  - Cliente não quis assinar
  - Cliente ausente
  - Local de risco
  - Entrega autorizada sem assinatura
  - Seguradora autorizou sem assinatura
- Ao justificar recusa, o sistema não exige nome/documento do cliente para resolver a pendência.
- Recusa é salva como assinatura recusada/justificada em `phaseSignatures` e `customerSignature` quando aplicável.
- `hasSignature()` agora reconhece recusa com motivo, sem exigir aceite textual manual.

### 3. Zerar provas / reiniciar etapa
- Adicionados botões:
  - `ZERAR ETAPA`
  - `ZERAR PROVAS`
- `ZERAR ETAPA` reinicia a etapa atual e limpa provas/assinatura daquela etapa.
- `ZERAR PROVAS` limpa provas do atendimento para recomeçar.
- Não apaga chamado, motorista, rota nem despesas.

### 4. Fluxo popular do motorista
- Card principal ganhou ação rápida `ZERAR PROVAS`.
- Menu MAIS também mostra opção de zerar provas quando o chamado não está finalizado.
- Assinatura no fluxo popular informa que nome/documento não bloqueiam recusa.

## Arquivos principais alterados

- `motorista.html`
- `css/style.css`
- `js/motorista.js`
- `js/motorista-simple-flow.js`
- `service-worker.js`
- `version.json`
- HTMLs raiz com query string V27 para evitar cache antigo
- `tests/motorista-v27-ux-provas.test.js`
- `tests/run-all.js`

## Testes locais executados

```bash
node --check js/motorista.js
node --check js/motorista-simple-flow.js
node --check service-worker.js
node tests/motorista-v27-ux-provas.test.js
node tests/run-all.js
```

Resultado:

```text
ALL TESTS PASSED
```
