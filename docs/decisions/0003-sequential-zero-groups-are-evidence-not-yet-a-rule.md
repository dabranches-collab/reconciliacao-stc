# ADR 0003 — Grupos sequenciais de saldo zero são evidência, não regra aprovada

Data: 2026-08-07

## Contexto

As 11.989 linhas fechadas manualmente podem ser decompostas, preservando a ordem do extracto e excluindo as pendências finais, em seis blocos que somam exactamente zero: 5.938, 3.050, 2.802, 195, 2 e 2 movimentos.

As pendências de 06/08 estão intercaladas com linhas fechadas. Portanto, um cutoff temporal ou FIFO simples não reproduz a escolha humana.

## Decisão

Registar as seis fronteiras como evidência estrutural do processo, mas não implementar “saldo acumulado zero” como regra automática enquanto não estiver demonstrado como os membros dos grupos grandes são seleccionados.

## Consequências

- Pares directos e grupos pequenos podem ser avaliados separadamente em testes futuros.
- Os grupos grandes exigem referência adicional, preferencialmente o workbook original SharePoint e validação operacional.
- A aplicação futura deverá guardar grupos explícitos e explicar os seus membros; não poderá fechar silenciosamente um agregado arbitrário.
