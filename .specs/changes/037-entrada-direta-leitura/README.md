# 037 — Entrada direta para leitura

## Objetivo
Facilitar a primeira ação de visitantes que chegam à raiz do aplicativo sem exigir autenticação. O estado inicial anterior apresentava apenas Chapters, que abria outro menu antes da leitura.

## Alteração
Adicionar como primeira opção um link visível para a primeira seção revisada do capítulo 1, informando que é possível ler sem entrar e que a conta salva o progresso. Manter as demais rotas e o HTML inicial e a renderização dinâmica coerentes. Não alterar home.html: há experimento Ads ativo envolvendo essa página e a raiz.

## Verificação
`npm run check` e `npm run test:analytics` passaram (34 testes). Em servidor local, a página inicial exibiu o novo link e a navegação abriu a primeira seção revisada sem autenticação. A visualização móvel específica não foi verificada; a interface usa o layout responsivo já existente. Não houve publicação nem mudança em Google Ads. O efeito sobre cadastro e uso ainda não foi medido.

## Pendências
Verificar experiência móvel real e comportamento com e sem conta; considerar que publicar mudança na raiz enquanto experimento de destinos está ativo altera uma das condições do teste e limita sua interpretação. Validar evento de primeiro cadastro em produção e medir resultados após publicação.

PO_MAGICO_SOURCE: ../po-magico
PO_MAGICO_VERSION_USED: v20261101.001
PO_MAGICO_LAST_CHECKED: 2026-11-03
PO_MAGICO_CHECKPOINT: change
PO_MAGICO_DELTA_ADOPTED: not-applicable
PO_MAGICO_LESSON_CANDIDATE: none

## Validação de liberação — 03/11/2026

Tela móvel simulada com largura de 390 px: ação visível e funcional, abrindo a primeira seção. Sessão local autenticada observada; sessão local sem autenticação havia sido verificada anteriormente. `npm run check`, 34 testes de analytics e `git diff --check` passaram. Superfície alterada: apenas HTML/CSS da entrada pública; nenhuma mudança de autenticação, dados, dependências ou backend. Publicação solicitada pelo titular; rollback pelo deploy anterior. Uma janela de avaliação apareceu durante a navegação local, para análise posterior. O teste de anúncios da raiz terá uma mudança de condição após o deploy.
