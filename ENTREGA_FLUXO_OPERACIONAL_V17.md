# JM Guinchos — V17 Motorista Modo Rua com Acessos Preservados

## Objetivo
Corrigir a V16 sem simplificar nem remover funções: o motorista continua com Modo Rua simples, mas volta a ter acesso claro e imediato a Chamados, Mapa, GPS, Provas, Despesas e Etapas/Histórico.

## Correção principal
Na V16, a tela principal ficou limpa demais e passava a sensação de que módulos foram removidos. A V17 mantém a tela principal com uma ação por vez, mas adiciona uma faixa de acessos rápidos:

- Chamados
- Mapa
- GPS
- Provas
- Despesa
- Etapas

## Preservado
- Chamados do motorista
- Mapa/rota
- GPS/localização
- Provas/fotos
- Galeria/câmera
- Assinatura
- Justificativas
- Despesas
- Etapas anteriores
- Modo técnico completo
- Salvamento das provas corrigido no V15
- Gestor, financeiro, relatórios, Firebase Rules e RTDB Rules

## Arquivos principais alterados
- motorista.html
- css/style.css
- js/motorista-simple-flow.js
- js/motorista.js
- js/app.js
- service-worker.js
- version.json
- testes

## Validação local
Executado:

```text
node --check js/motorista-simple-flow.js
node --check js/motorista.js
node --check js/app.js
node tests/run-all.js
```

Resultado:

```text
ALL TESTS PASSED
```

## Observação honesta
Isso valida sintaxe e estrutura. O teste final deve ser feito no celular: motorista abre chamado, usa Modo Rua, acessa Chamados/Mapa/GPS/Provas/Despesas, envia foto e confirma no gestor.
