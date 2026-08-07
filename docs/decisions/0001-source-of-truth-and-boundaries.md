# ADR 0001 — Fonte de verdade e fronteiras

Data: 2026-08-07

## Decisão

GitHub é a fonte central; cada computador usa `C:\Projetos\reconciliacao-stc`. OneDrive guarda apenas inputs/outputs externos. EMIS e BankOps são referências read-only nesta fase. STC permanece aplicação independente integrada ao BankOps por navegação normal.

## Consequências

- Excel reais e segredos não entram no Git.
- Não existe fusão de bases, iframe ou sessão partilhada por defeito.
- Conhecimento necessário à continuidade é documentado no repositório.
