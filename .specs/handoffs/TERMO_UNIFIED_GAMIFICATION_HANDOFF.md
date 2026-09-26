# TERMO — pacote de execução da metodologia unificada de aprendizagem e gamificação

## Como usar este arquivo

Leve este arquivo para uma tarefa aberta no repositório TERMO:

`/Users/marioreis/Library/CloudStorage/Dropbox/Mac (6)/Documents/GitHub/termo`

Ele é um pacote de transferência autossuficiente. Na tarefa do TERMO:

1. trate o conteúdo abaixo como a solicitação do proprietário;
2. leia `CODEX_CONTEXT.md`, `.specs/changes/README.md`, o template de Change e o Pó Mágico ativo antes de agir;
3. use a skill `adaptive-learning-gamification` e, para qualquer etapa do Supabase, a skill `supabase`;
4. inspecione o código e o estado remoto em vez de presumir que a documentação representa a produção;
5. crie e execute as Changes descritas aqui no próprio repositório TERMO;
6. não modifique o repositório QUANTUM a partir da tarefa do TERMO;
7. não faça commit, push, deploy ou mutação remota sem autorização explícita do proprietário. No vocabulário do projeto, `cpd` significa commit, push e deploy.

Este arquivo não é evidência de execução. Cada Change deve registrar o modelo realmente usado quando exposto, testes, falhas, correções, revisão e estado de publicação.

## Objetivo do programa

Preservar a experiência operacional consolidada do TERMO — simuladores, simulados por capítulo, Desafio do dia, pontos e jornada — enquanto o projeto adota a mesma metodologia acadêmica, contrato técnico e critérios de validação do QUANTUM.

A unificação não significa copiar a interface do QUANTUM nem substituir o TERMO. Significa que os dois livros passam a compartilhar:

- definições dos modos de aprendizagem;
- envelope de eventos e semântica das evidências;
- regras de idempotência, pontos, domínio e recomendações;
- limites de IA, privacidade e comunicação;
- critérios de testes e avaliação acadêmica.

O TERMO continua em português e mantém conteúdo, capítulos, simuladores, identidade visual e adapter de pontos próprios. Identificadores internos compartilhados podem permanecer em inglês para garantir contratos estáveis.

## Estado conhecido que deve ser confirmado

- O roadmap atual já reserva `030-auditoria-paridade-termo-quantum` para a auditoria final.
- A Change `049-recuperacao-configuracao-publica-auth` está em implementação local e deve ser concluída antes dos fluxos autenticados deste programa.
- A produção canônica é `https://termo.app.br`; `termo-theta.vercel.app` é origem legada com redirecionamento permanente.
- Em 2026-09-23, `https://termo.app.br/api/public-config` retornou `authEnabled: true`, embora uma captura do proprietário tenha mostrado a mensagem de configuração ausente. T49 deve diagnosticar cache, origem, rede, configuração de deploy e comportamento real do navegador antes de declarar a correção concluída.
- O TERMO já possui código para `gamification-profile`, eventos, simulados por capítulo, Desafio do dia, pontos, streaks e atividade de simuladores. A existência do código não substitui teste autenticado de ponta a ponta.
- A atividade de simulador existente registra abertura. A metodologia unificada distingue abertura de previsão, interação significativa, reflexão e conclusão de objetivo.
- O registro editorial e o manifesto de fontes são autoridades para elegibilidade. Conteúdo bloqueado, não revisado ou sem fonte aprovada não pode entrar em exercícios, simulados orientados, simulado, Desafio do dia, recomendações ou comunicação.

## Princípios não negociáveis

1. Aprendizagem vinculada ao conteúdo vem antes da gamificação estrutural.
2. Pageview, scroll, refresh ou abertura de simulador não constituem domínio.
3. Pontos reconhecem ações pedagógicas verificadas, mas não provam aprendizagem.
4. Erros nunca retiram pontos já conquistados.
5. Pontos não compram respostas, notas, dispensas, alternativas removidas, dificuldade menor ou domínio.
6. Ranking individual público fica desligado por padrão.
7. Domínio exige recuperação sem ajuda em sessões diferentes e, quando aplicável, em mais de uma representação.
8. Erro, acerto com baixa confiança, acerto com ajuda, solução revelada e acerto autônomo são evidências diferentes.
9. Recomendações devem explicar por que foram apresentadas, a fonte revisada, o tempo esperado e uma alternativa.
10. IA só opera sobre material publicado e elegível, preserva proveniência e possui fallback determinístico.
11. Comunicação opcional exige opt-in afirmativo, limites de frequência, pausa e descadastro.
12. Métricas de aprendizagem, comportamento, experiência, fidelidade de implementação e equidade/segurança permanecem separadas.

## Modos de aprendizagem compartilhados

### Prática da seção

Aplicação imediata e curta de um conceito revisado. Conclusão é evidência de atividade, não domínio.

### Simulado do capítulo

Diagnóstico mais amplo oferecido manualmente e próximo da conclusão substancial do capítulo. Deve incluir correção, revisão guiada e nova tentativa focalizada. Não é o Desafio do dia.

### Desafio do dia

Sessão curta de recuperação espaçada, normalmente com 3–5 itens ou 5–10 minutos. Escolhe conceitos vencidos, fracos ou ainda não confirmados, com pequena parcela intercalada. Ausência em um dia não gera punição.

### Recuperação guiada

Após erro ou acerto de baixa confiança:

1. identificar o ponto a revisar sem entregar a resposta;
2. oferecer fonte ou pré-requisito;
3. apresentar dicas graduais;
4. fornecer feedback ou caminho trabalhado;
5. solicitar nova questão semelhante, mas não idêntica;
6. agendar recuperação posterior.

### Atividade de simulador

Fluxo preferido: `prever -> manipular -> comparar -> explicar`. Registrar separadamente:

- `simulator_opened`;
- `simulator_prediction_recorded`;
- `simulator_meaningful_interaction`;
- `simulator_reflection_recorded`;
- `simulator_goal_completed`.

Nem todo simulador precisa suportar imediatamente todas as etapas. O adapter deve declarar capacidades e nunca promover `opened` a aprendizagem ou domínio.

## Contrato técnico compartilhado

### Três camadas

1. Ledger imutável de eventos de aprendizagem verificados.
2. Estado derivado do estudante: evidências por conceito, revisões, pontos, nível, missões, badges e próxima ação.
3. Apresentação: jornada, simulado, Desafio do dia, simulador, e-mail e analytics.

O cliente pode solicitar uma ação, mas não pode atribuir pontos, domínio, badges ou elegibilidade de mensagem de forma autoritativa.

### Envelope mínimo de evento

- `event_id`;
- `user_id` derivado da sessão verificada;
- `event_type` de allow-list versionada;
- `occurred_at` e `received_at`;
- `content_id`, `chapter_id`, `section_id`, `concept_ids` e `source_ids` quando aplicável;
- `attempt_id` ou `activity_id`;
- `idempotency_key` única para o evento semântico premiável;
- `policy_version`;
- metadados mínimos de evidência, sem segredos ou texto livre desnecessário.

Famílias compartilhadas:

- `section_completed`;
- `exercise_attempted`, `exercise_corrected`;
- `hint_used`, `solution_revealed`;
- `assessment_started`, `assessment_completed`, `assessment_reviewed`, `assessment_retry_completed`;
- `daily_challenge_completed`;
- eventos de simulador listados acima;
- `concept_retrieved`, `concept_mastery_reached`;
- `mechanic_eligible`, `mechanic_exposed`, `mechanic_acted`, `mechanic_opted_out`.

### Perfil unificado

O endpoint de perfil deve retornar snapshot versionado e consistente com:

- `generated_at` e `policy_version`;
- progresso em conteúdo publicado;
- evidências fracas, vencidas e insuficientes;
- revisões devidas;
- estado de simulados e simuladores;
- pontos, nível, recompensas recentes, badges e missões;
- próxima ação com `why`, fonte, duração e alternativa;
- estados vazios e de indisponibilidade seguros.

### Pontos iniciais compatíveis com TERMO

Preservar inicialmente, como adapter versionado e não como lei científica:

- conclusão elegível de seção: 20;
- primeiro simulado do capítulo: 30;
- revisão guiada concluída: 10;
- nova tentativa focalizada: 10;
- marco de domínio do capítulo: 80.

Uma volta diária sem atividade significativa não recebe recompensa. Toda premiação é atômica, idempotente e limitada quando houver risco de farming.

## Sequência de Changes no TERMO

### Pré-requisito existente — T49

Concluir `049-recuperacao-configuracao-publica-auth` antes de executar os fluxos autenticados abaixo.

Gates mínimos:

- origem canônica e origem legada testadas em navegador limpo;
- `/api/public-config` válido e sem cache incorreto;
- login, retorno OAuth, logout e restauração de sessão testados;
- variáveis públicas presentes e segredos ausentes do cliente;
- produção só declarada corrigida após smoke autenticado.

### T50 — contrato unificado e adapter do TERMO

#### Objetivo

Versionar no TERMO a metodologia compartilhada, mapear o comportamento atual e criar um adapter explícito sem alterar ainda a experiência pública.

#### Rota planejada

- Preferida: `gpt-5.6-sol / high`.
- Fallback: `gpt-5.6-terra / high` para documentação limitada; manter Sol para arquitetura transversal.
- Registrar a rota real somente quando o runtime a expuser.

#### Requisitos e tarefas

1. Criar a Change pelo template canônico do TERMO.
2. Incorporar ou referenciar de modo versionado a blueprint `adaptive-learning-gamification`.
3. Inventariar eventos, tabelas, RPCs, endpoints, pontos, streaks, missões, badges, simulados, Desafio do dia e atividade de simuladores existentes.
4. Mapear cada evento legado para o envelope compartilhado ou classificá-lo como analytics sem efeito pedagógico.
5. Criar um adapter versionado de política do TERMO contendo valores, limites, elegibilidade e versões.
6. Criar fichas de mecanismo para pontos, nível, streak, badge, missão e qualquer elemento social.
7. Registrar lacunas, conflitos, migrações necessárias e comportamento que será preservado.
8. Adicionar testes de contrato que possam posteriormente ser executados também pelo QUANTUM.

#### Aceitação

- Nenhum evento legado fica sem classificação.
- Analytics não atribui recompensa nem domínio.
- Adapter e fichas de mecanismo estão versionados.
- Conteúdo bloqueado falha fechado.
- Testes de contrato iniciais passam sem mudar produção.
- Não há alteração de schema ou deploy nesta Change documental/contratual.

### T51 — ledger, projeções e perfil autoritativo

#### Objetivo

Migrar o núcleo de aprendizagem para operações atômicas, idempotentes, reconciliáveis e protegidas, preservando o histórico válido.

#### Rota planejada

- Preferida: `gpt-5.6-sol / xhigh`.
- Fallback: `gpt-5.6-sol / high` após checkpoint; `gpt-5.5 / xhigh` somente se o host atual suportar e a causa exigir.

#### Requisitos e tarefas

1. Confirmar identidade, organização e projeto Supabase exatos antes de qualquer mutação.
2. Consultar changelog e documentação atuais; descobrir comandos da CLI com `--help`.
3. Auditar tabelas, funções, grants, RLS, índices e Data API das estruturas atuais.
4. Gerar migrations pelo fluxo oficial do projeto; não inventar nome de migration.
5. Manter RLS em tabelas expostas e testar grants separadamente das policies.
6. Criar ou adaptar ledger e projeções com unicidade de idempotência.
7. Inserir evento e atualizar perfil na mesma transação/RPC; fixar `search_path`, restringir `EXECUTE` e verificar `auth.uid()` quando `SECURITY DEFINER` for realmente necessário.
8. Nunca expor `service_role`; não usar `user_metadata` para autorização.
9. Implementar perfil snapshot único e versionado.
10. Reconciliar histórico em dry run, com alvo limitado e proteção contra duplicidade.
11. Testar anônimo, usuário próprio, outro usuário, admin e serviço.
12. Rodar advisors e registrar evidências antes de propor publicação.

#### Aceitação

- Retry, refresh e clique duplicado não criam pontos extras.
- Perfil reconcilia com o ledger.
- Usuário não lê nem altera dados de outro usuário.
- Histórico é preservado ou migrado com relatório de contagem.
- Respostas ocultas, tokens, e-mails e segredos não aparecem em logs.
- Toda mutação remota e deploy permanecem sujeitos a autorização explícita.

### T52 — modos adaptativos e recompensas pedagógicas

#### Objetivo

Aplicar o ciclo comum aos simuladores, simulados por capítulo, Desafio do dia, revisão guiada, pontos, missões e badges.

#### Rota planejada

- Preferida: `gpt-5.6-sol / high`.
- Fallback: `gpt-5.6-sol / xhigh` após duas tentativas de validação sem melhora ou falha transversal.

#### Requisitos e tarefas

1. Criar grafo versionado de conceitos, representações e pré-requisitos para conteúdo publicado.
2. Registrar acerto autônomo, acerto com ajuda, baixa confiança, erro, solução revelada e ausência como evidências distintas.
3. Implementar revisão guiada e nova tentativa de near transfer no simulado.
4. Selecionar o Desafio do dia entre conceitos estudados, fracos ou vencidos; manter pequena parcela intercalada.
5. Não punir ausência diária nem usar streak como ameaça.
6. Tornar capacidades pedagógicas dos simuladores explícitas e registrar interação significativa apenas quando suportada.
7. Explicar toda próxima ação no painel `Pontos e simulados`.
8. Preservar valores iniciais do TERMO por adapter, sem confundi-los com aprendizagem.
9. Manter ranking global fora de escopo.
10. Restringir IA a fontes aprovadas e guardar proveniência, modelo quando exposto, política e estado de validação.
11. Garantir rota de relato de erro e correção administrativa.

#### Aceitação

- Simulado do capítulo e Desafio do dia continuam distintos.
- Pergunta futura responde ao histórico de erros e sucessos, não apenas a aleatoriedade.
- Domínio não nasce de um único acerto.
- Abrir simulador não conta como aprendizagem nem rende pontos.
- Revisão e retry possuem fontes revisadas.
- Fallback determinístico funciona sem IA.
- Desktop, mobile, teclado, leitor de tela e estados de falha passam.

### T53 — Ajuda metodológica e explicabilidade pública

#### Objetivo

Criar a página pública `Ajuda — Como funciona seu aprendizado` e explicações contextuais nas superfícies de aprendizagem.

#### Rota planejada

- Preferida: `gpt-5.6-terra / medium`.
- Fallback: `gpt-5.6-sol / medium` para conflitos de arquitetura, acessibilidade ou conteúdo.

#### Conteúdo público obrigatório

- como exercícios são produzidos, vinculados ao livro e revisados;
- diferença entre prática, simulado, Desafio do dia e simulador;
- como atividades são escolhidas;
- o que acontece após erro, acerto, baixa confiança e uso de dica;
- o que pontos, nível, missões e badges significam — e o que não significam;
- o que conta como domínio;
- limites do uso de IA e presença de revisão humana;
- dados de aprendizagem armazenados, controles e privacidade;
- como relatar possível erro;
- referências acadêmicas, versão e data da metodologia.

#### Implementação esperada

1. Criar URL pública estável e indexável, preferencialmente estática ou gerada de fonte única.
2. Adicionar `Ajuda` ao menu e links contextuais nas telas de pontos, simulado, Desafio do dia e simuladores.
3. Adicionar respostas curtas a `Por que estou vendo isto?`, `Como ganho pontos?`, `O que conta como uso do simulador?` e `Posso escolher outra atividade?`.
4. Manter documentação técnica completa no repositório sem publicar detalhes que facilitem farming ou exponham segurança.
5. Incluir acessibilidade, canonical, sitemap, structured data e testes de links.

#### Aceitação

- Disponível sem login e legível em português.
- Versão e atualização aparecem na página.
- Não promete eficácia além das evidências.
- Não revela respostas, dados pessoais, thresholds exploráveis ou detalhes de segurança.
- Menu, links contextuais, SEO e acessibilidade passam.

### T54 — avaliação acadêmica e comunicação responsável

#### Objetivo

Separar claramente evidências de aprendizagem de métricas de uso e avaliar a metodologia sem manipulação de retorno.

#### Rota planejada

- Preferida: `gpt-5.6-sol / high`.
- Fallback: `gpt-5.6-terra / high` para relatórios limitados; manter Sol para desenho experimental e privacidade.

#### Requisitos e tarefas

1. Definir separadamente resultados de aprendizagem, comportamento, experiência, fidelidade de implementação e equidade/segurança.
2. Registrar elegibilidade, exposição, ação, recompensa, duplicata suprimida e opt-out para cada mecânica.
3. Medir baseline quando uma alegação de ganho de aprendizagem for pretendida.
4. Incluir retenção tardia e questão em forma diferente antes de alegar domínio ou transferência.
5. Registrar amostra, exposição, atrito, dados ausentes, tamanho de efeito, incerteza e efeitos adversos.
6. Não converter clique, tempo, tentativa, satisfação ou total de pontos em ganho acadêmico.
7. Manter e-mail opcional sob opt-in, limites, quiet hours, pausa e unsubscribe.
8. Proibir perda ameaçada de pontos, rank, mastery ou urgência artificial em mensagens.
9. Separar GA4/telemetria do ledger de aprendizagem.
10. Criar painel administrativo de fidelidade e qualidade sem expor desempenho individual indevidamente.

#### Aceitação

- Relatórios dizem exatamente qual resultado foi medido.
- Mensagens funcionam sem coerção e não são necessárias para usar o produto.
- GA4 não atribui pontos nem domínio.
- Consentimento e descadastro são testados.
- Qualquer alegação acadêmica inclui método, limitações e incerteza.

### T30 — auditoria final de paridade TERMO/QUANTUM

Executar a Change já reservada somente depois que o programa correspondente do QUANTUM e T50–T54 estiverem implementados e publicados.

Comparar comportamento real, não somente nomes ou arquivos:

- versões do contrato e adapters;
- eventos e idempotência;
- perfil, pontos, níveis e recompensas;
- simuladores;
- simulados/assessments;
- Desafio do dia/Daily Challenge;
- revisão guiada e retry;
- conteúdo elegível e proveniência;
- ajuda metodológica;
- privacidade, comunicação e IA;
- testes de contrato e smoke autenticado.

Diferenças editoriais ou linguísticas são válidas. Diferenças sem justificativa devem gerar uma nova Change no projeto afetado, não uma correção silenciosa durante a auditoria.

## Ordem de execução e dependências

```text
T49 autenticação/configuração
  -> T50 contrato e adapter
      -> T51 ledger, projeções e perfil
          -> T52 modos adaptativos e recompensas
              -> T53 Ajuda e explicabilidade
              -> T54 avaliação e comunicação

Após o QUANTUM concluir seu programa correspondente:
T30 auditoria final de paridade
```

T53 pode iniciar em paralelo com partes finais de T52 somente depois que os nomes, estados e regras públicas estiverem estáveis. T54 pode preparar o desenho antes, mas só deve interpretar dados após a fidelidade de implementação ser demonstrada.

## Referências metodológicas mínimas

- Retrieval practice: Roediger e Karpicke (2006).
- Distributed practice: Cepeda et al. (2006).
- Successive relearning: Rawson e Dunlosky (2022).
- Feedback e confiança: Butler, Karpicke e Roediger (2008).
- Sucesso de recuperação e suporte: Pastötter e Bäuml (2020).
- Richter e Kickmeier-Rust (2025): maior engajamento não implicou vantagem clara no quiz; amostra pequena e curta.
- Balci, Secaur e Morris (2022): badges e leaderboards não melhoraram desempenho acadêmico nos experimentos analisados.
- Gaurina, Alajbeg e Weber (2025): melhoras de percepção não constituem evidência de aprendizagem; vantagens em prova por pontos não serão adotadas.

Trabalhos retratados e relatórios baseados apenas em metadados não sustentam decisões ou alegações de produto.

## Gates transversais

Antes de declarar qualquer Change concluída:

- conteúdo e fontes elegíveis verificados;
- erros, acertos, dicas e solução revelada cobertos;
- operações premiáveis atômicas e idempotentes;
- RLS e grants testados separadamente;
- anônimo, próprio usuário, outro usuário, admin e serviço testados;
- nenhuma informação sensível em logs ou analytics;
- mobile 320 px, zoom, teclado, foco, leitor de tela e reduced motion testados;
- estados de loading, offline, retry, clique duplo e falha parcial testados;
- testes unitários, handler, banco, contrato e browser executados;
- versão, modelo real quando exposto, fallbacks, revisão e evidências registrados;
- commit, push, mutação remota e deploy somente com autorização explícita.

## Resultado esperado

O usuário continua reconhecendo o TERMO atual: pontos, simuladores, simulados por capítulo e Desafio do dia. A diferença é que os recursos passam a compartilhar um núcleo auditável, explicar suas recomendações, preservar fontes, medir aprendizagem separadamente de engajamento e manter paridade verificável com o QUANTUM.
