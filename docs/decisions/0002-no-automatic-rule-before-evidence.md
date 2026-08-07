# ADR 0002 — Não automatizar sem evidência

Data: 2026-08-07

## Contexto

O bloco manual fechado entre 31/07 e 06/08 contém 11.989 movimentos e soma zero, mas número de operação e pares de valor oposto não explicam todos os grupos.

## Decisão

Não implementar como regra automática o fecho de qualquer subconjunto global que apenas some zero. Uma regra automática deve produzir grupos explicáveis, determinísticos, versionados e testados contra posições conhecidas.

## Consequências

- A transição histórica está reproduzida, mas a cobertura automática aprovada permanece 0%.
- Pares exactos e prioridade temporal ficam classificados como candidatos prováveis até validação adicional.
