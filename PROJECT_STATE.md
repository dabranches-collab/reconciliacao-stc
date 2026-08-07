# Estado actual do projecto

Actualizado em: 2026-08-07

## Resumo

- Repositório oficial clonado em `C:\Projetos\reconciliacao-stc`.
- O remoto estava vazio; esta fundação documental constitui o primeiro conteúdo local.
- Os três ficheiros STC foram analisados read-only e a transição 31/07 → 06/08 foi reproduzida a 100% por identidade de movimentos.
- Nenhuma regra contabilística automática foi implementada.
- Reconciliação EMIS e BankOps Hub foram analisados read-only.

## Evidência funcional principal

- Pendências a 31/07: 1.320.
- Movimentos novos válidos: 11.355 (a folha inclui ainda uma linha de totais, que não é movimento).
- Universo activo combinado: 12.675.
- Movimentos acrescentados a `Rec.`: 11.989.
- Pendências a 06/08: 686.
- Identidade verificada: `1.320 + 11.355 = 11.989 + 686`.
- As 11.989 linhas fechadas somam exactamente zero em unidades mínimas.
- Todas as 1.320 pendências anteriores foram fechadas.
- As 686 pendências finais são movimentos novos de 06/08, todos com valor negativo.
- Pares de valores exactamente opostos cobrem no máximo 2.704 linhas (22,554% do bloco fechado); só 1.318 linhas formam pares de valor não ambíguos.

## Limite actual

Foi demonstrado o resultado manual, não a decomposição segura de todas as 11.989 linhas em grupos contabilísticos independentes. Número de operação e valor oposto não explicam sozinhos o universo fechado. Não automatizar o fecho global apenas porque o bloco agregado soma zero.

## Infraestrutura

- Supabase `nhcovhrogmwknhcecgpk`: `ACTIVE_HEALTHY`, Postgres 17, sem tabelas públicas, migrations ou Edge Functions.
- Cloudflare Worker `reconciliacao-stc`: existe; código actual é apenas uma resposta `Hello world`.
- EMIS local: `main`, checkout preservado read-only; continha três commits locais à frente de `origin/main` no início da análise.
- BankOps local: clonado apenas para consulta read-only.

## Próximo marco

Obter ou identificar evidência que ligue os movimentos de compensação agregados às transferências/salários individuais e explique exactamente quais movimentos de 06/08 entram no fecho. Só depois aprovar a primeira versão das regras automáticas.
