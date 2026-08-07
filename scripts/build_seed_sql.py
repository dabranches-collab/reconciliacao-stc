from __future__ import annotations

import json
import sys
from pathlib import Path


source = Path(sys.argv[1])
output_dir = Path(sys.argv[2])
output_dir.mkdir(parents=True, exist_ok=True)
payload = json.loads(source.read_text(encoding="utf-8"))
source_info = payload["source"]
position = payload["position"]

metadata_sql = f"""
begin;
insert into public.import_batches
  (source_name, source_sha256, mode, status, period_start, period_end, movement_count, imported_by)
values
  ({json.dumps(source_info['name'])}, '{source_info['sha256']}', 'integrated', 'integrated', '2026-08-06', '2026-08-06', 686,
   (select id from public.platform_users where username = 'dabranches'))
on conflict (source_sha256) do nothing;

insert into public.positions
  (position_date, previous_pending_count, new_movement_count, reconciled_count, closing_pending_count,
   accounting_balance_minor, closing_pending_balance_minor, status)
values
  ('{position['position_date']}', {position['previous_pending_count']}, {position['new_movement_count']},
   {position['reconciled_count']}, {position['closing_pending_count']}, {position['accounting_balance_minor']},
   {position['closing_pending_balance_minor']}, '{position['status']}')
on conflict (position_date) do update set
  previous_pending_count = excluded.previous_pending_count,
  new_movement_count = excluded.new_movement_count,
  reconciled_count = excluded.reconciled_count,
  closing_pending_count = excluded.closing_pending_count,
  accounting_balance_minor = excluded.accounting_balance_minor,
  closing_pending_balance_minor = excluded.closing_pending_balance_minor,
  status = excluded.status;

delete from public.reconciliation_groups where position_id = (select id from public.positions where position_date = '2026-08-06');
insert into public.reconciliation_groups (position_id, sequence_number, movement_count, balance_minor, evidence_level)
select p.id, g.sequence_number, g.movement_count, 0, 'confirmed_result'
from public.positions p
cross join (values {', '.join(f'({index}, {count})' for index, count in enumerate(payload['groups'], 1))}) as g(sequence_number, movement_count)
where p.position_date = '2026-08-06';
commit;
"""
metadata_sql = metadata_sql.replace(json.dumps(source_info["name"]), "'" + source_info["name"].replace("'", "''") + "'")
(output_dir / "000_metadata.sql").write_text(metadata_sql, encoding="utf-8")

columns = [
    "fingerprint", "source_row", "movement_date", "dc", "amount_minor", "operation", "description",
    "observation", "document_number", "ordering_party", "beneficiary", "iban", "bic", "state",
]
for start in range(0, len(payload["movements"]), 100):
    chunk = payload["movements"][start:start + 100]
    encoded = json.dumps(chunk, ensure_ascii=False).replace("'", "''")
    sql = f"""
insert into public.movements ({', '.join(columns)}, source_batch_id)
select {', '.join('r.' + column for column in columns)},
  (select id from public.import_batches where source_sha256 = '{source_info['sha256']}')
from jsonb_to_recordset('{encoded}'::jsonb) as r(
  fingerprint text, source_row integer, movement_date date, dc text, amount_minor bigint,
  operation text, description text, observation text, document_number text, ordering_party text,
  beneficiary text, iban text, bic text, state text
)
on conflict (fingerprint) do nothing;
"""
    (output_dir / f"{start // 100 + 1:03d}_movements.sql").write_text(sql, encoding="utf-8")

print(json.dumps({"files": 1 + (len(payload["movements"]) + 99) // 100, "movements": len(payload["movements"])}))
