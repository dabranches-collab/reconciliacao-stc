# Modelo de dados inicial — proposta

Este documento é desenho, não migration aplicada. Os nomes podem evoluir antes da primeira aplicação ao Supabase.

## Núcleo

### `platform_users`

Identidade operacional controlada pelo servidor. O primeiro registo reservado tem identificador `dabranches`, nome apresentado `Diogo Abranches` e papel `owner`. Não usa email como identificador de login.

### `authentication_credentials` e `authentication_attempts`

Credencial PIN guardada apenas como hash com salt e registo de tentativas/bloqueios. Estas estruturas ficam em schema privado e nunca são expostas directamente ao browser.

### `accounts`

Identifica conta, balcão, moeda e série operacional. Uma série de posições pertence a uma conta/moeda.

### `import_batches`

Guarda hash do ficheiro, nome apenas informativo, modo (`analysis_only`/`integrated`), período detectado, contagens, estado, heartbeat e erro accionável.

### `movements`

Valores originais imutáveis e campos derivados separados. Montante em unidades mínimas inteiras. Inclui fingerprint robusta, estado activo e importação de origem.

### `positions`

Fotografia lógica por data de corte: saldo contabilístico, saldo do residual, estado de cálculo e versão das regras. Não exige fecho mensal.

### `reconciliation_groups`

Unidade principal do histórico. Guarda método, versão, origem automática/manual, saldo exacto, estado e timestamps.

### `reconciliation_members`

Relação entre grupos e movimentos. Um movimento só pode pertencer a um grupo activo de cada vez.

### `proposals`

Combinações plausíveis ainda não fechadas. Guarda score/evidência explicável, nunca apenas uma probabilidade opaca.

### `reconciliation_events`

Eventos mínimos de confirmar, rejeitar e reabrir. Observação opcional na reabertura STC.

### `job_checkpoints`

Fases/blocos idempotentes de importação, matching, métricas e validação.

## Invariantes de base

- `closing_pending_balance = accounting_balance` para uma posição concluída.
- Todo grupo activo reconciliado tem saldo exacto zero, salvo regra futura explicitamente documentada.
- `previous_open + new = reconciled + closing_open` por contagem e montante.
- Movimentos fechados permanecem persistidos e saem apenas do universo activo.
- Reabrir invalida o grupo activo e devolve os membros a `open` numa transacção.
- Métricas só ficam `completed` depois de todas as invariantes passarem.

## Segurança

- Todas as tabelas expostas terão RLS.
- Perfis e cliente/entidade serão derivados de dados de autorização controlados, nunca de `user_metadata` editável.
- Funções privilegiadas ficam fora de schemas expostos e não usam `SECURITY DEFINER` sem necessidade e verificação explícitas.
