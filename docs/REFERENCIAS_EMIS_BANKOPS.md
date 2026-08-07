# Referências EMIS e BankOps

Análise read-only realizada em 2026-08-07.

## A — Transversal e reutilizável

### Arquitectura EMIS

- React/TypeScript/Vite no frontend, Supabase com RLS e Cloudflare Worker como fronteira server-side.
- Upload multipart para R2, hash, checkpoints idempotentes e Workflows duráveis.
- Estados reais de importação, heartbeat, retoma após refresh e conclusão atómica.
- Movimentos originais preservados, normalizações derivadas e método/versão de regra por reconciliação.
- Métricas materializadas/cached para não percorrer milhões de movimentos em cada ecrã.
- Paginação e ordenação server-side alinhadas com índices.
- Perfis `platform_owner`, `client_admin`, `analyst` e `auditor`, protegidos também por backend/RLS.

### UX EMIS

- Entrada pelo dashboard de Resultados.
- Resultados primeiro; detalhes técnicos e anomalias sob expansão.
- `Movimentos` abre nos pendentes, tem filtros rápidos, ordenação, datas, escolha de colunas, carregamento progressivo e exportação filtrada.
- `Confirmações` usa grupos colapsados, expansão de movimentos, saldo visível, selecção parcial válida apenas quando fecha a zero e acções em massa.
- Progresso persistido, mensagem explícita de que o browser pode ser fechado e recuperação da mesma tarefa.
- PWA, claro/escuro, navegação móvel, estados vazios honestos e mensagens accionáveis.
- Reconciliados automáticos consultáveis, sem exigir confirmação individual.

## B — Específico EMIS, não copiar

- IDTR, referências `/26`, campos `MR*`, fronteira Real Time e janela operacional D+7.
- Regras de operação/descrição próprias dos extractos EMIS.
- Nomes, métricas e linguagem de Real Time.
- Justificação manual obrigatória quando a STC pede observação opcional e pouca burocracia.
- Buckets e número de fases exactamente iguais; devem resultar do volume e das regras STC.

## Dívida técnica EMIS a não reproduzir

- `App.tsx` concentra navegação, importação, recuperação e muitas vistas; a STC deve separar shell, domínio e fluxos.
- Coexistência prolongada de V1/V2 aumenta complexidade e risco de caminhos divergentes.
- Componentes muito compactados dificultam revisão e manutenção.
- A sequência extensa de migrations correctivas mostra que contratos de importação/métricas devem ser estabilizados com testes antes de produção.
- Caches e RPCs específicos resolveram escala real da EMIS, mas não devem ser copiados antes de medir o workload STC.
- O ensaio de buckets paralelos causou contenção/`lock_timeout`; paralelismo deve ser medido, não assumido.

## Melhorias propostas para STC

- Separar desde início `import`, `matching`, `positions`, `reconciliations` e `reporting`.
- Tornar reabertura um evento de domínio simples e transaccional.
- Distinguir explicitamente regra confirmada, proposta e decisão humana no modelo e na UI.
- Ter contratos de métricas e estados de jobs definidos antes da primeira importação produtiva.
- Evitar duplicação V1/V2: activar funcionalidades somente quando completas.

## Integração BankOps

O BankOps é um launcher estático/PWA. Não usa Supabase, SSO, iframes ou agregação de dados. Cada aplicação abre por link normal numa origem `workers.dev` independente.

Para STC:

- manter repositório, deployment, Supabase, autenticação e dados independentes;
- alinhar identidade e navegação de entrada com o ecossistema;
- numa tarefa própria e posterior, trocar o cartão STC de “Em desenvolvimento” para link activo;
- não alterar BankOps nesta primeira fase;
- não presumir cookies ou sessão partilhada entre origens.
