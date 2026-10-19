# Prompt para o Codex — C35

Cole o bloco abaixo no Codex.

```text
Execute a Change C35 do QUANTUM: .specs/changes/035-launch-hardening-and-campaign-start/

Checkout obrigatório: /Users/marioreis/Library/CloudStorage/Dropbox/Mac (6)/Documents/Developer/qm
NUNCA trabalhe em Documents/GitHub/qm (também está ligado ao projeto Vercel qm).
Confirme pwd -P, origin https://github.com/MSR-BR/qm.git, branch main, árvore limpa e HEAD = origin/main antes de começar.

Leia primeiro, nesta ordem:
1. CODEX_CONTEXT.md e .specs/po-magico-reference.md
2. .specs/changes/035-launch-hardening-and-campaign-start/ (audit-2026-10-19.md, objective.md, requirements.md, acceptance-criteria.md, tasks.md)
3. .specs/changes/018-google-ads-readiness/activation-gates-2026-10-19.md e conversion-setup-2026-10-19.md

Siga tasks.md seção por seção (A → F), marcando cada item e registrando evidências na própria Change. Regras:

APP (seção B)
- R1: fixe a versão exata da Supabase JS em assets/termo-auth.js (use a versão hoje resolvida pelo jsDelivr para a URL sem versão, salvo incompatibilidade) e atualize cache-busters necessários.
- R2: no máximo um section_complete por seção por navegador após desmarcar/remarcar; sem mudar progresso no banco nem pontos. Teste.
- R3: TTL de atribuição deslizante (30 min de inatividade), só as três tuplas conhecidas, limpo na revogação. Teste.
- Não mude defaults de consentimento, sinais Google (ad_personalization sempre denied), nomes/parâmetros de eventos, contrato do relay, nem nada do TERMO.
- Rode: npm run test:analytics, node --test tests/*.test.mjs, npm run check, npm run validate:seo, scripts/test-qm-analytics-browser.mjs (leia antes; tudo é stubado) e git diff --check.
- PARE e peça "cpd" ao dono antes de commit/push/deploy. Depois do cpd: Vercel READY, bytes de produção = HEAD (lembre que / passa por lib/qm-index-response.mjs) e peça ao dono um login Google para checar login/reload/logout. Não marque seção como concluída nesse teste.

MEDIÇÃO (seção C)
- Documente a linha de base limpa: a partir de 18/10/2026 22:13 BRT (dpl_8PKH1ta448yxdEJK7tVYFz5pgPg9), excluindo codex_qa / qa. O section_complete de 18/10 21:33 (accounts.google.com / referral) é o teste QA interno da seção 1.1 antes da correção; o de 12:28 é provavelmente a revisão C15 (inferência). Não os chame de tráfego real nem de conversão.
- Registre que conversões no Ads são limite inferior (medição publicitária opt-in, modo básico). Métrica principal do piloto: sessões GA4 google / cpc / quantum_international_en_search_pilot e sua taxa de section_complete.
- Se tiver acesso de leitura ao GA4 554204628, rode o relatório por dateHourMinute, eventName, sessionSourceMedium, sessionCampaignName; senão marque "não confirmado".
- Atualize CODEX_CONTEXT.md (linha que diz "C18 has not started") e .specs/project-state.md.

ADS (seções D e E)
- Faça primeiro a verificação SOMENTE LEITURA da conta 3838359068 com todos os valores esperados em tasks.md seção D. Qualquer divergência: PARE e reporte, não corrija sozinho.
- Mostre o snapshot ao dono e pergunte: "Confirma ativar a campanha QUANTUM agora?". Só ative com um "sim" explícito nesta sessão.
- Ordem: 8 keywords → anúncio 828563447756 → grupo 199601244925 → campanha 24369162368 por último, com releitura após cada passo.
- PROIBIDO: tocar na campanha TERMO 24027143907, metas padrão da conta, orçamentos compartilhados, faturamento, outras campanhas/rascunhos; aumentar orçamento; mudar lances; personalização/remarketing; clicar nos próprios anúncios; gclid falso; eventos GA4 injetados.
- Se o Google bloquear o navegador como inseguro ou não houver sessão Ads operável, não contorne: deixe pronto o checklist para o dono ativar manualmente e registre.
- Depois: releia TERMO e metas padrão (inalterados), abra a landing com o sufixo UTM (sem gclid, sem clicar em anúncio), confira 200, painel de consentimento e botão de login. Registre horário BRT, plano de monitoramento (24 h, depois diário por 7 dias), regras de parada (pausar já por landing/login quebrado, regressão de consentimento, URL/meta errada, anúncio enganoso; revisão manual com EUR 14 gastos sem conclusão atribuída qualificada) e rollback (pausar só a campanha QUANTUM) em launch-AAAA-MM-DD.md. Marque a última tarefa da C18 com link para a C35.

GERAL
- Nunca leia nem imprima valores de .env*, chaves, cookies, tokens ou segredos OAuth.
- Separe sempre observação direta, inferência e dado indisponível.
- Ao final, entregue um resumo em português: o que mudou, testes, deploy, estado do Ads com horários, e o que ficou pendente.
```
