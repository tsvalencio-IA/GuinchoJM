# JM Guinchos — V4 Fluxo Simplificado

Versão preparada para novo repositório.

## Objetivo
Simplificar a experiência visual sem remover fluxos internos:

- gestor continua com central, chamados, mapa, financeiro, provas, relatórios e integrações;
- motorista ganha modo guiado com menos informação na tela;
- provas, assinatura, GPS, despesas, checklist e histórico continuam preservados;
- cálculo confuso de guincho automático fica fora da experiência principal;
- rota/KM/pedágio continuam como apoio assistido/manual;
- IA reconhece blocos A/D Base, B Local Ocorrência, C Destino e Distância Total.

## Publicação
Suba todos os arquivos deste pacote na raiz do novo repositório GitHub Pages.

Arquivos principais:

- `index.html`
- `jm.html`
- `motorista.html`
- `superadmin.html`
- `cliente-chamado.html`
- `relatorio.html`
- `css/`
- `js/`
- `assets/`
- `service-worker.js`
- `manifest.json`
- `version.json`

## Testes locais executados

```bash
npm run check:js
node tests/run-all.js
```

## Observação
Não foram alteradas Firebase Rules/RTDB Rules neste pacote.
