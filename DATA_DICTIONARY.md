# Dicionário de dados inicial

Este documento distingue campos observados de significados ainda não determinados. Os nomes finais do modelo não estão aprovados.

## Extracto Banka (`Folha1`)

| Campo observado | Tipo aparente | Evidência / interpretação |
| --- | --- | --- |
| Conta Aplic. Bancária | identificador textual | `2521251` nos ficheiros analisados. |
| Data Contabilística | data | Eixo temporal aparente do movimento. |
| Data Lançamento | data | Data de lançamento; pode coincidir com a contabilística. |
| Descrição | texto | Descrição original; deve ser preservada sem normalização destrutiva. |
| Numero Operação | identificador | Não é único; operações de compensação podem abranger muitas linhas. |
| Valor Débito | decimal | Contribui positivamente para `Valor Movimento` na posição. |
| Valor Crédito | decimal | Contribui negativamente para `Valor Movimento` na posição. |
| Origem | texto | Ex.: `Movimentos de C/CO`; sem regra funcional determinada. |
| Balcão | identificador | `500` na amostra. |
| Moeda | código | `AKZ` no extracto; a posição usa `AOA`. Tratar como aliases a validar. |
| Cliente | identificador/zero | Significado operacional não determinado. |
| Natureza | código/zero | Significado operacional não determinado. |
| Sequência | código/zero | Significado operacional não determinado. |

Valor assinado observado: `valor_movimento = valor_debito - valor_credito`, convertido exactamente para unidades mínimas.

## Posição (`STC` e `Rec.`)

| Campo observado | Tipo aparente | Evidência / interpretação |
| --- | --- | --- |
| Balcão | texto composto | Ex.: `500AKZ`; parece combinar balcão e moeda. Não usar como contrato sem validação. |
| Conta | identificador | `2521251`. |
| Data | data | Data contabilística aparente. |
| Déb./Créd. | enum `D`/`C` | Derivado do sinal em fórmulas observadas. |
| Valor Movimento | decimal assinado | Débito positivo, crédito negativo. |
| Saldo | decimal | Acumulado da folha, não saldo bancário nativo por movimento. |
| Nº Doc. Externo | identificador | Corresponde ao `Numero Operação` do extracto na reprodução. |
| Descritivo do Movimento | texto | Corresponde à descrição do extracto para os movimentos novos. |
| Antiguidade | inteiro | Fórmula `DAYS(data da posição, data do movimento)`; sem calendário operacional. |
| OBS | texto/código | Contém valores como `RUPE`; significado e origem não totalmente determinados. |
| DO | desconhecido | Não determinado. |
| Ordenante | texto | Metadado adicional, frequentemente vazio. |
| Beneficiário | texto | Metadado adicional, frequentemente vazio. |
| IBAN | texto | Metadado adicional, frequentemente vazio. |
| BIC | texto | Metadado adicional, frequentemente vazio. |

## Entidades propostas

- `accounts`: conta, balcão, moeda e cliente/entidade.
- `import_batches`: ficheiro, hash, modo, período detectado, estado e checkpoints.
- `movements`: valores originais imutáveis, campos normalizados derivados e fingerprint.
- `positions`: data de corte e métricas concluídas.
- `reconciliation_groups`: regra, versão, origem automática/manual, estado e saldo.
- `reconciliation_members`: movimentos pertencentes ao grupo.
- `proposals`: candidatos ainda não fechados.
- `reconciliation_events`: confirmação, rejeição e reabertura.
