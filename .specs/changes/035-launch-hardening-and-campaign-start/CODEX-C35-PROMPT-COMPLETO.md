# C35 — Endurecimento do app e início da campanha QUANTUM (prompt único para o Codex)

Este documento é autocontido. Se a pasta `.specs/changes/035-launch-hardening-and-campaign-start/` ainda não existir no checkout, crie-a e grave nela os registros indicados na seção 9.

---

## 0. Checkout e governança

- Checkout obrigatório: `/Users/marioreis/Library/CloudStorage/Dropbox/Mac (6)/Documents/Developer/qm`
- **Nunca** trabalhe em `Documents/GitHub/qm`. Ele também está ligado ao projeto Vercel `qm`, e um deploy feito de lá publicaria a cópia errada.
- Antes de começar, confirme: `pwd -P`, origin `https://github.com/MSR-BR/qm.git`, branch `main`, árvore limpa e HEAD = `origin/main`. Na auditoria de 19/10/2026 o HEAD era `e04b107`, publicado como `dpl_GVZ8AQg31YtaoKPSYYTAxW21JRxw`.
- Leia `CODEX_CONTEXT.md`, `.specs/po-magico-reference.md` e, na C18, `activation-gates-2026-10-19.md` e `conversion-setup-2026-10-19.md`.
- Commit, push e deploy **só** com um `cpd` explícito do dono.
- Nunca leia nem imprima valores de `.env*`, chaves, cookies, tokens ou segredos OAuth.
- Em todo relatório, separe observação direta, inferência e dado indisponível. Não preencha lacunas com specs antigas.

---

## 1. Objetivo

Fechar as pequenas lacunas técnicas e de medição encontradas na auditoria independente somente leitura de 19/10/2026. Depois disso, iniciar com segurança o piloto Google Ads do QUANTUM já preparado na C18, com uma linha de base de medição limpa.

**Fora de escopo:**
- Código, painéis, campanha `24027143907` e conversões do TERMO.
- Metas padrão da conta, orçamentos compartilhados, faturamento e configurações da conta.
- Aumento de orçamento, mudança de lances, personalização, remarketing e públicos.
- Cliques fabricados, gclid falso, eventos GA4 injetados ou cliques nos próprios anúncios.
- Mudanças nos padrões de consentimento: a medição publicitária continua opt-in e `ad_personalization` continua sempre `denied`.

---

## 2. Resumo da auditoria de 19/10/2026 (entrada desta Change)

**Confirmado diretamente:**
- O HEAD `e04b107` é igual a `origin/main`. O deployment 7177172274 do GitHub (`vercel[bot]`, SHA `e04b107`) tem status Vercel *success* para `dpl_GVZ8AQg31YtaoKPSYYTAxW21JRxw`.
- Os bytes publicados são iguais aos do HEAD em: `qm-analytics.js` (`f695ff95…`), CSS, `termo-auth.js`, `termo-seo.js`, `qm-study-progress.js`, `qm-gamification.js`, `home.html`, `privacy.html`, sitemaps e robots. A rota `/` é igual a `renderIndexResponse(index.html)` de `lib/qm-index-response.mjs`.
- Testes: `test:analytics` 22/22, Node 139/139, `check`, `validate:seo` (85 seções), `git diff --check` e o teste de navegador com tudo simulado em 320, 390 e 1440 px.
- Nenhuma tag Google no HTML antes do consentimento e nenhum ID `AW-`/`G-` de outro projeto.
- A configuração pública aponta para o Supabase `crasnnvdvujzxudmbakv`, com só o provider `google` ativo. O client ID do Google pertence ao projeto `quantum-book-auth-20260926` (número 1091169926547).

**Não confirmado (sem acesso naquela sessão):** relatórios processados do GA4 554204628, Search Console e todo o estado atual do Google Ads.

**Achados:**

| Pri. | Achado | Evidência |
|---|---|---|
| P1 | Estado atual do Ads não reverificado de forma independente. | Sem acesso |
| P1 | O segmento "não-QA" contém tráfego interno. O `section_complete` de 18/10 às 21:33 (`accounts.google.com / referral`) bate com o teste QA da seção 1.1, feito antes da correção (21:33:29, entrada com `codex_qa / qa`). O das 12:28 é provavelmente a revisão C15 (inferência). | C18 `paused-campaign-setup-2026-10-18.md` linhas 153–165 e `activation-gates-2026-10-19.md` linhas 34–53 |
| P2 | As conversões no Ads serão subcontadas por desenho: gclid e `ad_storage` só existem após o opt-in publicitário, que vem desmarcado, em modo básico. | `assets/qm-analytics.js` 175–181, 198–199, 466 |
| P2 | Supabase JS carregada do CDN sem versão fixada. Uma major nova pode quebrar o login com a campanha no ar. | `assets/termo-auth.js:23` |
| P3 | Desmarcar e remarcar uma seção reenvia `section_complete`. Infla o GA4; o Ads deduplica com ONE_PER_CLICK. | `qm-study-progress.js` 139–145, `qm-analytics.js` 688–697 |
| P3 | O TTL de atribuição é absoluto (30 min), não deslizante. | `qm-analytics.js` 159–161 |
| P3 | O e-mail do dono aparece em `/api/public-config` (`validatorEmails`), e o controle parece ficar na interface. | `lib/public-config-handler.mjs:8`, `index.html:4824` |
| P3 | Documentação desatualizada: `CODEX_CONTEXT.md:39` diz "C18 has not started", e `project-state.md:29` também está defasado. | — |

**Opinião de prontidão:** app, consentimento e atribuição estão prontos. A janela de 24 h foi uma escolha conservadora, não uma regra do Google. A referência de 14 dias é para otimizar orçamento, não para o primeiro dia de um piloto de EUR 2/dia em Maximize Clicks. O que falta de fato é reverificar o Ads e ter a confirmação do dono.

---

## 3. Autorização do dono

Em 19/10/2026, o dono revisou o app ("a princípio ok") e pediu esta execução. A ativação já tinha sido autorizada na C18, sujeita aos portões técnicos. Mesmo assim, **antes de alterar qualquer status no Ads**, apresente o snapshot da seção 6 e pergunte:

> "Confirma ativar a campanha QUANTUM agora?"

Só ative com um "sim" explícito nesta sessão.

---

## 4. Melhorias no app (requisitos R1–R4)

- **R1.** Fixe a versão exata da Supabase JS em `assets/termo-auth.js`. Use a versão que o jsDelivr resolve hoje para a URL sem versão, salvo incompatibilidade. Atualize os cache-busters necessários (os loaders em `termo-auth.js`, `termo-seo.js` e `qm-simulator-catalog.js`, e as tags `?v=` das páginas). Login, logout, persistência após recarregar e o `redirectTo` do OAuth devem continuar iguais.
- **R2.** Envie no máximo um `section_complete` por seção por navegador depois de desmarcar e remarcar. Sugestão: um marcador por seção em `localStorage`, apagado na revogação do analytics. Não mude progresso no banco nem pontos. Adicione teste.
- **R3.** TTL de atribuição deslizante: renove a validade a cada página vista com consentimento enquanto houver uma campanha conhecida salva, com limite de 30 min de inatividade. Continue aceitando só as três tuplas conhecidas e limpando na revogação. Adicione teste.
- **R4.** Não mude: padrões de consentimento, sinais Google, sentido do texto de privacidade, nomes e parâmetros de eventos, contrato do relay `/api/qm-analytics-event`, nada do TERMO.
- **Opcional,** só se for trivial e testado: tirar `validatorEmails` da configuração pública, desde que exista checagem no servidor. Caso contrário, apenas documente. Nunca enfraqueça a autorização no servidor.

**Validação obrigatória:**

```bash
npm run test:analytics
node --test tests/*.test.mjs
npm run check
npm run validate:seo
QM_PLAYWRIGHT_MODULE=/Users/marioreis/node_modules/playwright node scripts/test-qm-analytics-browser.mjs
git diff --check
```

Leia cada script antes de rodar. O teste de navegador simula todas as requisições externas.

**Depois:** **PARE e peça `cpd`.** Após o `cpd`:
- Confirme a Vercel READY e os bytes de produção iguais ao HEAD. Lembre que `/` passa por `lib/qm-index-response.mjs`.
- Peça ao dono **um** login Google para checar login, reload e logout. Não marque nenhuma seção como concluída nesse teste.

---

## 5. Medição (R5–R6)

- **R5.** Documente a linha de base limpa para decisões pagas: a partir de **18/10/2026 22:13 BRT** (`dpl_8PKH1ta448yxdEJK7tVYFz5pgPg9`), excluindo `codex_qa / qa`. Marque o evento de 21:33 como teste interno (correspondência direta) e o de 12:28 como provável teste interno (inferência). Não os chame de tráfego real nem de conversão.
- **R6.** Registre que as conversões no Ads são um **limite inferior**. Métricas principais do piloto:
  - Sessões GA4 `google / cpc / quantum_international_en_search_pilot` e a taxa de `section_complete` delas.
  - Cliques, custo e termos de pesquisa no Ads.
  - As conversões no Ads ficam como métrica secundária.
- Se houver acesso de leitura ao GA4 554204628, rode o relatório de 18/10 até hoje por `dateHourMinute`, `eventName`, `sessionSourceMedium` e `sessionCampaignName`, filtrado em `section_complete`. Registre a linha QA de 19/10 (~11:40). Se não houver acesso, marque "não confirmado".
- Atualize `CODEX_CONTEXT.md` (a linha 39) e `.specs/project-state.md` com o estado real da C18 e da C35.

---

## 6. Verificação do Ads SOMENTE LEITURA (pare em qualquer divergência)

Conta MSR-BR `3838359068`, EUR. Valores esperados:

- [ ] Campanha `24369162368` (QUANTUM - Search - International - EN - Pilot) **PAUSED**.
- [ ] Orçamento `15962079046` independente (não compartilhado), EUR 2,00 médio por dia.
- [ ] Maximize Clicks (TARGET_SPEND), teto de CPC EUR 0,25.
- [ ] Só Google Search: Search Partners e Display desligados.
- [ ] Idioma inglês `1000`. Geo positivo `PRESENCE`.
- [ ] Exatamente 17 países: 2356 Índia, 2076 Brasil, 2840 EUA, 2586 Paquistão, 2360 Indonésia, 2566 Nigéria, 2484 México, 2032 Argentina, 2124 Canadá, 2036 Austrália, 2554 Nova Zelândia, 2710 África do Sul, 2608 Filipinas, 2050 Bangladesh, 2404 Quênia, 2826 Reino Unido, 2372 Irlanda.
- [ ] Grupo `199601244925` PAUSED.
- [ ] Anúncio `828563447756` PAUSED, política APPROVED, URL final só `https://quantummechanicsbook.app/`. Registre os títulos e descrições exatos (a última leitura indicou 8 títulos e 3 descrições).
- [ ] Oito keywords positivas PAUSED (exata/frase):
  - exata: `learn quantum mechanics`, `quantum mechanics interactive book`, `quantum mechanics exercises`, `quantum physics simulator`
  - frase: `learn quantum mechanics`, `interactive quantum mechanics`, `quantum mechanics exercises`, `quantum mechanics simulations`
- [ ] Onze negativas de frase só na campanha, sem lista compartilhada: `quantum computing`, `quantum computer`, `quantum ai`, `trading`, `crypto`, `healing`, `manifestation`, `jobs`, `salary`, `torrent`, `pirated`.
- [ ] Sufixo de URL final `utm_source=google&utm_medium=cpc&utm_campaign=quantum_international_en_search_pilot`. Modelo de rastreamento vazio. Auto-tagging ligado.
- [ ] Metas no nível CAMPAIGN com só a meta personalizada `6459537936`, contendo só a ação `7855071770` (QUANTUM (web) section_complete): ENABLED, ONE_PER_CLICK, secundária, valor 0.
- [ ] Nenhum asset ativo de campanha ou de conta que possa servir nesta campanha. Os sitelinks de conta `211723829310` e `212167698599` devem estar PAUSED. Assets automáticos, personalização de texto e expansão de URL final desligados.
- [ ] Gasto acumulado EUR 0.
- [ ] Baseline do TERMO `24027143907` registrado só por leitura (status, orçamento, metas CUSTOMER) para comparar depois.

---

## 7. Ativação (só após o "sim" explícito do dono nesta sessão)

1. Mostre o snapshot da seção 6 e faça a pergunta da seção 3.
2. Ative na ordem, relendo o status depois de cada passo:
   1. as 8 keywords
   2. o anúncio `828563447756`
   3. o grupo `199601244925`
   4. a campanha `24369162368`, **por último**
3. Releia o TERMO e as metas padrão da conta: devem estar inalterados.
4. Abra a landing com o sufixo UTM, sem gclid e sem clicar em anúncio. Confira: 200, painel de consentimento e botão de login presentes.
5. Se o Google bloquear o navegador como inseguro ou não houver sessão Ads operável, **não contorne**. Deixe o checklist pronto para o dono ativar manualmente e registre o bloqueio.

**Proibido:**
- Tocar no TERMO, nas metas padrão, em orçamentos compartilhados, no faturamento ou em outras campanhas e rascunhos (por exemplo o rascunho genérico "Campaign #1").
- Aumentar o orçamento ou mudar lances.
- Ativar personalização ou remarketing.
- Clicar nos próprios anúncios, usar gclid falso ou injetar eventos.

---

## 8. Monitoramento, regras de parada e rollback

- **Monitoramento:** checar landing, login e consentimento logo após ativar. Depois verificar status e gasto no Ads em até 24 h, e diariamente por 7 dias: impressões, cliques, custo, termos de pesquisa, reprovações, sessões GA4 `google / cpc` e `section_complete` no segmento limpo.
- **Pausar imediatamente** em caso de landing ou login quebrado, regressão de consentimento, URL ou meta errada, ou anúncio enganoso.
- **Revisão manual** ao chegar a EUR 14 gastos sem nenhuma conclusão atribuída qualificada. Isso é um gatilho de revisão, não um teto automático.
- **Orçamento:** EUR 2 é a média diária. O Google pode gastar até EUR 4 em um dia e até EUR 60,80 em um mês completo. Nenhum aumento está autorizado.
- **Otimização de orçamento:** só depois de 14 dias limpos.
- **Rollback:** pausar só a campanha QUANTUM `24369162368` e depois inspecionar o segmento GA4 e as metas. O TERMO não deve ser tocado.

---

## 9. Registros a gravar em `.specs/changes/035-launch-hardening-and-campaign-start/`

- `objective.md`, `requirements.md`, `acceptance-criteria.md`, `tasks.md` (crie-os a partir das seções 1–8, se não existirem) e `audit-2026-10-19.md` (a seção 2).
- `validation-evidence.md`: testes, deploy e verificação de bytes.
- `launch-AAAA-MM-DD.md`: snapshot pré-ativação, horários BRT de cada passo, releituras, TERMO inalterado, monitoramento, regras de parada e rollback.
- Na C18, marque a última tarefa de `tasks.md` com link para a C35.

---

## 10. Critérios de aceite

- [ ] Supabase JS com versão fixada. Login, reload e logout verificados em produção pelo dono.
- [ ] Desmarcar e remarcar gera no máximo um `section_complete` por navegador. Progresso e pontos inalterados. Coberto por testes.
- [ ] TTL deslizante, limpo na revogação. Coberto por testes.
- [ ] Todas as validações da seção 4 passam.
- [ ] Linha de base limpa e hierarquia de métricas documentadas.
- [ ] `CODEX_CONTEXT.md` e `project-state.md` atualizados.
- [ ] Snapshot do Ads somente leitura igual ao esperado, mais a confirmação do dono antes de ativar.
- [ ] Após a ativação: keywords, anúncio, grupo e campanha QUANTUM ENABLED. TERMO e metas padrão inalterados. Landing e consentimento verificados.
- [ ] Monitoramento, regras de parada e rollback registrados com horários.

---

## 11. Entrega final

Resumo em português contendo:
- o que mudou no código;
- resultados dos testes;
- deploy (SHA e ID);
- estado do Ads com horários BRT;
- situação do GA4;
- o que ficou pendente;
- confirmação explícita do que **não** foi alterado (TERMO, metas padrão, orçamento, faturamento).
