# Backlog

## Prioridade imediata

- [ ] Obter acesso read-only ou uma cópia local autorizada do workbook original SharePoint `BK_Reconciliação 2521251_STC 06_08_2026_AKZ.xlsx`; a cópia `Diogo` perdeu a folha `BL`.
- [ ] Validar com o utilizador/processo operacional como são escolhidas as 1.117 linhas negativas de 06/08 fechadas e as 686 que permanecem pendentes.
- [ ] Procurar no workbook por metadados, ordenantes, beneficiários, IBAN, BIC ou documentos auxiliares que definam grupos menores; os campos existem na posição, mas estão maioritariamente vazios na amostra.
- [ ] Determinar a relação entre `STC - Compensação RCT` e os pagamentos/transferências individuais.
- [ ] Definir tolerância monetária oficial; internamente usar unidades mínimas inteiras.
- [ ] Validar regras candidatas com outro período completo e medir falsos positivos/falsos negativos.
- [x] Testar cutoff/FIFO simples: rejeitado porque as pendências estão intercaladas.
- [x] Decompor o resultado manual em fronteiras sequenciais de saldo zero: seis grupos encontrados.

## Fundação técnica — após validação funcional

- [x] Criar scaffold React/TypeScript/Vite com identidade Banco Keve alinhada à EMIS.
- [x] Implementar dinheiro exacto em unidades mínimas e testes das invariantes da posição conhecida.
- [x] Criar a primeira navegação operacional e área de selecção/soma de movimentos.
- [x] Tornar a aplicação instalável como PWA (manifest, ícone, service worker e estratégia inicial de actualização).
- [ ] Publicar uma versão segura no Cloudflare Worker já reservado e documentar a URL pública; antes, remover os valores reais da versão pública ou proteger o acesso.
- [ ] Implementar o ADR 0004: proprietário `dabranches`, provisionamento privado do PIN, rate limiting, sessão segura e auditoria.
- [ ] Definir schema Supabase reproduzível, RLS e perfis mínimos necessários.
- [ ] Implementar importação em dois modos: `Analisar apenas` e `Integrar na reconciliação`.
- [ ] Implementar fingerprint/deduplicação independente do nome do ficheiro.
- [ ] Implementar jobs duráveis, checkpoints, progresso real e recuperação após refresh.
- [ ] Implementar universo activo indexado e histórico fechado por grupos.
- [ ] Implementar propostas, confirmação/rejeição e reabertura transaccional.
- [ ] Implementar posições a qualquer data e testes de invariância por frequência de importação.
- [ ] Integrar navegação no BankOps numa tarefa separada, sem fundir aplicações.

## Qualidade futura

- [ ] Alargar os testes já existentes de exactidão monetária a duplicados, sobreposição, reabertura e concorrência.
- [ ] Benchmarks com volumes crescentes e planos de consulta.
- [ ] Testes claro/escuro, desktop em várias escalas, tablet e mobile adequado.
- [ ] Exportação Excel/CSV do residual respeitando filtros activos.
