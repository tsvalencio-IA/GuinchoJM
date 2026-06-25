# JM Guinchos — Fluxo Operacional V24

## Correções desta versão

1. **Finalizados não conflita mais com o handler genérico do menu**
   - o botão Finalizados agora para propagação do clique;
   - abre a lista de chamados finalizados;
   - não volta sozinho para o painel ativo.

2. **Detalhes do card principal agora funciona de verdade**
   - o atalho DETALHES fora do menu também abre o modo detalhado;
   - remove o modo exclusivo de assinatura antes de abrir detalhes.

3. **Ações do checklist/provas reforçadas**
   - adicionada proteção extra para clique nas abas Retirada/Inspeção/Carga/Transporte/Entrega/Assinar;
   - se o botão CONTINUAR bloquear por pendência, ele aponta para a primeira pendência em vez de parecer que não aceitou.

## Preservado
- Fotos/provas
- Galeria/câmera
- Assinatura
- Justificativas
- GPS/rota
- Despesas
- Chamados finalizados em consulta
- Gestor/JM
- Financeiro
- Firebase/RTDB/Cloudinary

## Arquivos alterados
- js/motorista-simple-flow.js
- tests/run-all.js
- tests/motorista-v24-acoes-finalizados.test.js
- ENTREGA_FLUXO_OPERACIONAL_V24.md
