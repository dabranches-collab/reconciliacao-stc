# Backlog

## Prioridade imediata

- [ ] Validar com o utilizador/processo operacional como são escolhidas as 1.117 linhas negativas de 06/08 fechadas e as 686 que permanecem pendentes.
- [ ] Procurar no workbook por metadados, ordenantes, beneficiários, IBAN, BIC ou documentos auxiliares que definam grupos menores; os campos existem na posição, mas estão maioritariamente vazios na amostra.
- [ ] Determinar a relação entre `STC - Compensação RCT` e os pagamentos/transferências individuais.
- [ ] Definir tolerância monetária oficial; internamente usar unidades mínimas inteiras.
- [ ] Validar regras candidatas com outro período completo e medir falsos positivos/falsos negativos.

## Fundação técnica — após validação funcional

- [ ] Criar scaffold React/TypeScript/Vite com identidade Banco Keve alinhada à EMIS.
- [ ] Definir schema Supabase reproduzível, RLS e perfis mínimos necessários.
- [ ] Implementar importação em dois modos: `Analisar apenas` e `Integrar na reconciliação`.
- [ ] Implementar fingerprint/deduplicação independente do nome do ficheiro.
- [ ] Implementar jobs duráveis, checkpoints, progresso real e recuperação após refresh.
- [ ] Implementar universo activo indexado e histórico fechado por grupos.
- [ ] Implementar propostas, confirmação/rejeição e reabertura transaccional.
- [ ] Implementar posições a qualquer data e testes de invariância por frequência de importação.
- [ ] Integrar navegação no BankOps numa tarefa separada, sem fundir aplicações.

## Qualidade futura

- [ ] Testes de exactidão monetária, duplicados, sobreposição, reabertura e concorrência.
- [ ] Benchmarks com volumes crescentes e planos de consulta.
- [ ] Testes claro/escuro, desktop em várias escalas, tablet e mobile adequado.
- [ ] Exportação Excel/CSV do residual respeitando filtros activos.
