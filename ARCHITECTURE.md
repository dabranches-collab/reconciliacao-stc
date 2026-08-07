# Arquitectura proposta

## Princípios

- Aplicação independente, ligada ao BankOps por navegação normal.
- Supabase como sistema central de dados/autenticação e Cloudflare Worker/Workflows para recepção e processamento durável.
- Movimentos originais imutáveis; normalizações e regras são derivadas, versionadas e auditáveis.
- Matching trabalha sobre candidatos activos, não sobre todo o histórico fechado.
- Métricas ausentes ou incompletas nunca aparecem como zero.

## Fluxo de importação

1. Receber o ficheiro por drag & drop/file picker.
2. Guardar hash e, no modo integrado, o original em armazenamento privado antes do processamento.
3. Detectar o esquema pelos cabeçalhos e validar tipos, conta, moeda, datas e linha de totais.
4. Apresentar pré-visualização: período real, movimentos, conhecidos, novos, posição anterior e continuidade.
5. Persistir movimentos novos idempotentemente.
6. Formar o universo activo: pendências abertas + movimentos novos.
7. Aplicar regras automáticas aprovadas por versão.
8. Criar propostas para candidatos fortes não determinísticos.
9. Publicar posição e métricas apenas depois de controlos de integridade.

`Analisar apenas` usa uma sessão isolada/temporária e não altera a série histórica. `Integrar` cria um lote central idempotente.

## Modelo de estado

- Movimento: `open` ou `reconciled`; o estado fechado deriva da participação num grupo activo.
- Grupo: `active`, `reopened` ou `superseded`.
- Proposta: `pending`, `approved`, `rejected` ou `expired`.
- Importação: fases persistidas (`uploading`, `uploaded`, `parsing`, `deduplicating`, `matching`, `metrics`, `validating`, `completed`, `failed`).

Reabrir um grupo é uma transacção: invalida o fecho, devolve membros a `open`, regista evento opcionalmente comentado e recalcula apenas métricas/posições afectadas.

## Dados e índices

Índices iniciais a validar no desenho SQL:

- movimentos abertos por conta/moeda/data;
- fingerprint único por conta/moeda e identidade robusta do movimento;
- chaves candidatas aprovadas pelas regras;
- membros por grupo e movimento;
- grupos por estado/data/regra;
- importações por hash/conta/período/estado;
- posições e métricas por série/data.

Valores monetários devem usar unidades mínimas inteiras ou `numeric` exacto. Nenhuma decisão de fecho usa `number` JavaScript.

## Interface

- Entrada por `Resultados`, não por importação.
- Resultados respondem primeiro: analisados, automáticos, propostas, por tratar, redução manual e posição.
- `Reconciliados`: lista por grupo colapsado, movimentos expansíveis, regra/versão/saldo e acção simples de reabrir.
- `Propostas`: padrão de grupos expansíveis, selecção, saldo, confirmar/rejeitar e operações em massa.
- `Por tratar`: aberto por defeito, paginação server-side, filtros rápidos, pesquisa, colunas configuráveis e exportação filtrada.
- PWA e navegação responsiva com identidade neutra na área consolidada; a identidade de cada banco fica limitada aos respectivos dashboards exclusivos.

## Fronteiras

- BankOps não lê dados STC, não partilha base, sessão ou cookies e não usa iframe.
- Regras EMIS (`IDTR`, `/26`, D+ Real Time e campos `MR*`) não pertencem à STC.
- A arquitectura durável da EMIS é referência; tabelas, nomes e regras devem ser próprios da STC.
