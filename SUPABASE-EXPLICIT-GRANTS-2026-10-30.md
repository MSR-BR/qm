# Tarefa executável — Quantum (`qm`) e mudança de privilégios do Supabase

Execute esta tarefa dentro do repositório **Quantum/qm**. Este arquivo descreve o objetivo do proprietário; confirme cada constatação no código atual antes de editar.

## Objetivo

Preparar o Quantum para a mudança de privilégios padrão do Supabase de 30 de outubro de 2026, preservando RLS, os fluxos atuais e o trabalho local em andamento.

## Estado encontrado em 2026-09-24

- Já existem privilégios explícitos para exercícios salvos, relatórios de validação, progresso de estudo, fontes do livro, atividade de simulador e tabelas operacionais.
- `lib/qm-gamification-handler.mjs` usa `service_role` pela Data API para ler/inserir/atualizar `qm_gamification_profiles` e ler/inserir `qm_gamification_events`.
- A migração de gamificação concede apenas `SELECT` a `authenticated`; não foi encontrado `GRANT` explícito para `service_role` nessas duas tabelas.
- `lib/qm-chapter-quiz-handler.mjs` usa `service_role` para ler e inserir em `qm_chapter_quiz_attempts`; a migração revoga `anon` e `authenticated`, mas não declara privilégio para `service_role`.
- Existe `npm run audit:supabase`, que cria usuários e dados temporários e depois limpa. Ele é útil, mas só deve ser executado contra um projeto remoto com autorização explícita.
- O diretório estava com alterações locais de outro trabalho. Preserve tudo e mantenha esta Change isolada.

## Trabalho obrigatório

1. Leia as instruções do repositório, o estado do projeto, as migrações e os handlers citados. Consulte a versão atual do Pó Mágico e crie uma Change independente.
2. Faça uma matriz de acesso para todas as tabelas, funções e sequências expostas: consumidor, papel, operações, RLS/policy e migração responsável pelo privilégio.
3. Confirme pelo código e pelos testes as operações exatas dos handlers. Se as constatações permanecerem válidas, crie **uma nova migração**, sem reescrever histórico aplicado, com privilégios mínimos equivalentes a:
   - `qm_gamification_profiles` para `service_role`: `SELECT`, `INSERT`, `UPDATE`;
   - `qm_gamification_events` para `service_role`: `SELECT`, `INSERT`;
   - `qm_chapter_quiz_attempts` para `service_role`: `SELECT`, `INSERT`.
4. Não conceda `DELETE`, `UPDATE` ou acesso a `anon`/`authenticated` onde o código não exige. Mantenha as policies de leitura autenticada já existentes e não use RLS como substituto de `GRANT`.
5. Verifique as demais migrações, incluindo possíveis sequências, para evitar uma correção parcial.
6. Adicione teste estático/de migração que detecte objetos novos sem decisão explícita de privilégio e testes unitários que confirmem que os handlers continuam usando somente as operações previstas.
7. Rode `npm run check` e os testes específicos disponíveis. Valide reset/migrações em Supabase local descartável se o ambiente estiver configurado.
8. Não execute `npm run audit:supabase` contra o remoto, não aplique migração remota e não faça deploy sem autorização explícita. Antes disso, apresente o diff SQL, os testes, o impacto e o rollback.

## Critérios de aceitação

- Gamificação e histórico de quiz funcionam numa instalação nova com os novos defaults.
- Os privilégios de `service_role` correspondem exatamente às operações dos handlers.
- Nenhum acesso adicional é concedido a `anon` ou ao navegador autenticado.
- O teste de regressão cobre tabelas e sequências futuras.
- As alterações locais preexistentes ficam intactas e fora do commit desta Change.

## Referências oficiais

- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- https://supabase.com/docs/guides/api/securing-your-api
