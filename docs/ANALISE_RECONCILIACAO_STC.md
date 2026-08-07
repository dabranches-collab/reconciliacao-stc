# Análise da Reconciliação STC

Data da análise: 2026-08-07

## 1. Fontes

Ficheiros externos, analisados read-only e não versionados:

- `BK_Reconciliação 2521251_STC 31_07_2026_AKZ.xlsx`
- `Extracto STC 01-08 Agosto.xlsx`
- `BK_Reconciliação 2521251_STC 06_08_2026_Diogo.xlsx`

O nome do ficheiro não foi usado como fonte normativa; datas, conta e período foram lidos do conteúdo.

## 2. Estrutura dos ficheiros

### Posição 31/07

- `Capa`: vazia.
- `STC`: posição de pendências; 1.320 movimentos, cabeçalho na linha 16.
- `Rec.`: universo reconciliado acumulado; 375.275 movimentos antes desta transição.
- `BL`: balancete da conta contabilística de compensação; saldo observado de `-1.744.178.093,94` AOA.
- `Extracto`: extracto Banka de 29/07 a 31/07; contém fórmulas auxiliares `Valor Débito = -Valor Crédito` nas linhas de crédito.
- `Cpi.ExcelAddins.ControlSheet`: metadados históricos de relatórios Banka.

### Extracto posterior

- `Cpi.ExcelAddins.ControlSheet`: parâmetros reais do relatório.
- `Folha1`: cabeçalho na linha 4, 11.355 movimentos nas linhas 5–11.359 e uma linha final de totais.
- Conta `2521251`, moeda `AKZ`; parâmetros 01/08–06/08.
- Datas contabilísticas efectivamente presentes: 01, 03, 04, 05 e 06/08/2026.
- Não contém fórmulas.

### Posição 06/08

- `Capa`: vazia.
- `STC`: 686 pendências.
- `Rec.`: 387.264 movimentos acumulados, mais 11.989 que em 31/07.
- A fórmula do saldo contabilístico em `STC!I9` aponta para referência externa (`[1]BL!F7`); o workbook já não contém a folha `BL`. Não copiar este acoplamento frágil para a aplicação.

## 3. Reprodução da transição

Foi usada como identidade comparável:

`data contabilística + número da operação/documento externo + valor em cêntimos`.

Resultado:

| Componente | Movimentos |
| --- | ---: |
| Pendências anteriores | 1.320 |
| Novos movimentos válidos | 11.355 |
| Universo activo | 12.675 |
| Acrescentados a `Rec.` | 11.989 |
| Pendências finais | 686 |
| Linhas perdidas/inventadas | 0 |

Todas as 686 pendências finais foram localizadas no extracto novo. Todas as 11.989 linhas acrescentadas a `Rec.` foram localizadas no universo combinado. A reprodução de identidade é 100%.

O bloco acrescentado a `Rec.` soma exactamente zero em cêntimos:

- positivos: 2.279 movimentos, `73.782.470.258,66` AOA;
- negativos: 9.710 movimentos, `-73.782.470.258,66` AOA.

Todas as 1.320 pendências de 31/07 foram fechadas. Dos 11.355 movimentos novos, 10.669 foram fechados e 686 ficaram pendentes. As pendências finais são todas negativas e datadas de 06/08.

## 4. Regras e evidência

### CONFIRMADA — valor assinado

Na passagem do extracto para a posição:

`valor_movimento = valor_débito - valor_crédito`.

Débitos são positivos (`D`) e créditos negativos (`C`). A linha de totais do relatório não é movimento.

### CONFIRMADA — continuidade do universo

A posição seguinte contém exactamente os movimentos novos ainda abertos; os restantes movimentos do universo combinado aparecem acrescentados a `Rec.`. Não há eliminação de movimentos na transição analisada.

### CONFIRMADA — condição do bloco fechado observado

O conjunto de 11.989 movimentos transferido manualmente para `Rec.` fecha exactamente a zero em unidades mínimas.

Esta confirmação descreve o resultado do trabalho humano. Não demonstra que qualquer subconjunto arbitrário com soma zero possa ser fechado automaticamente.

### CONFIRMADA — saldo contabilístico igual ao residual

Na posição de 06/08, a célula `STC!I9` conserva o último valor obtido de `[1]BL!F7`: `-4.828.241.591,79` AOA. A soma exacta dos 686 movimentos mantidos em `STC` é também `-4.828.241.591,79` AOA e a diferença apresentada em `STC!I13` é zero.

Logo, o processo humano escolheu o residual final para satisfazer simultaneamente:

1. `soma dos movimentos pendentes = saldo contabilístico`; e
2. `soma dos movimentos transferidos para Rec. = 0`.

Esta é uma invariante contabilística confirmada e deve ser sempre validada pela aplicação. Não é, isoladamente, uma regra de selecção: podem existir vários subconjuntos com o mesmo total, e um algoritmo de subset-sum sem critérios adicionais produziria reconciliações inexplicáveis.

### CONFIRMADA — número de operação não basta

Agrupar as 11.989 linhas por número de operação produz 5.652 grupos, dos quais apenas 54 somam zero. Existem operações de compensação com centenas de parcelas e transferências individuais com números distintos. Logo, “mesmo número de operação + soma zero” não reproduz o fecho.

### PROVÁVEL — prioridade temporal

Todos os movimentos até 05/08 foram fechados; em 06/08 foram fechados 1.605 de 2.291 e ficaram 686. Isto é consistente com tratamento por antiguidade/cutoff e escolha adicional de movimentos do próprio dia, mas a evidência não explica o critério de escolha dentro de 06/08.

### PROVÁVEL — pares exactos como regra candidata limitada

O máximo de linhas emparelháveis por valores exactamente opostos é 2.704 (22,554% do bloco fechado). Destas, 1.318 linhas pertencem a valores com exactamente um positivo e um negativo, sem ambiguidade apenas pelo montante.

Valor oposto pode suportar uma regra ou proposta quando combinado com atributos adicionais e testes de unicidade. Não explica 77,446% do bloco fechado.

### NÃO DETERMINADA — grupos contabilísticos completos

Não foi demonstrada a ligação entre as 4.000 linhas `STC - Compensação RCT` e as várias famílias de transferências/pagamentos individuais. O fecho global a zero não revela, sozinho, grupos auditáveis menores.

### NÃO DETERMINADA — selecção de 06/08

Ainda não se sabe por que 1.117 movimentos negativos de 06/08 foram fechados e 686 permaneceram abertos. É necessário descobrir uma referência, ficheiro auxiliar, regra de ordenação ou decisão operacional.

A hipótese de um cutoff/FIFO simples foi testada e rejeitada: as 686 pendências não formam um sufixo contínuo do extracto. Existem créditos pendentes intercalados com movimentos fechados. A ordem relativa das 686 linhas é, contudo, exactamente a mesma no extracto e na posição final.

### NÃO DETERMINADA — campos auxiliares

`OBS`, `DO`, `Ordenante`, `Beneficiário`, `IBAN` e `BIC` existem na posição, mas a sua origem e utilização no matching não estão demonstradas. Não inventar significados.

## 5. Distribuição relevante

As descrições novas incluem:

- `Emissão de Transferência a crédito`: 5.395;
- `STC - Compensação RCT`: 4.000;
- várias grafias de pagamento de salários;
- famílias menores de ICX, anulações, devoluções e transferências STC.

As diferenças de capitalização e texto devem ser preservadas no original. Qualquer descrição comparável deve existir num campo derivado e testado.

## 6. Limites e próximos testes

Antes de aprovar uma regra automática:

1. explicar os grupos menores que compõem os `73.782.470.258,66` AOA de cada sinal;
2. explicar a selecção dentro de 06/08;
3. testar unicidade e falsos positivos dos pares exactos;
4. procurar evidência em ficheiros/documentos auxiliares do processo STC;
5. validar com outro período conhecido;
6. obter tolerância oficial e manter cálculos em unidades mínimas exactas.

Até lá, a cobertura comprovada da **transição** é 100%, mas a cobertura de uma **regra automática aprovada** permanece 0%. A candidata mais simples (valor oposto) cobre no máximo 22,554% do bloco fechado e ainda não está aprovada.

## 7. Decomposição sequencial adicional

Ao percorrer os movimentos fechados na ordem original do extracto, excluindo as 686 pendências, o saldo acumulado atinge exactamente zero em seis fronteiras. O resultado manual pode ser particionado assim:

| Grupo observado | Pendências anteriores | Movimentos novos | Total | Saldo |
| --- | ---: | ---: | ---: | ---: |
| 1 | 1.320 | 4.618 | 5.938 | 0,00 |
| 2 | 0 | 3.050 | 3.050 | 0,00 |
| 3 | 0 | 2.802 | 2.802 | 0,00 |
| 4 | 0 | 195 | 195 | 0,00 |
| 5 | 0 | 2 | 2 | 0,00 |
| 6 | 0 | 2 | 2 | 0,00 |

Os grupos 5 e 6 são pares directos `STC - ICX enviado - Trf. Crédito`. O grupo 4 contém 193 linhas de compensação RCT negativas e duas transferências STC positivas. Os três grupos grandes combinam transferências, pagamentos de salários, compensação RCT e outras famílias.

Esta decomposição confirma que o fecho manual contém lotes auditáveis de soma zero. Ainda não demonstra o algoritmo que escolhe os membros dos grupos grandes, porque durante 06/08 alguns créditos são excluídos no meio da sequência.

## 8. Artefactos manuais e origem do workbook final

- Não existem filtros automáticos, tabelas Excel, tabelas dinâmicas ou comentários funcionais nas folhas `STC`/`Rec.` que codifiquem a escolha.
- Os comentários do workbook de 31/07 identificam apenas os relatórios Banka e Balancete Diário e os respectivos autores/metadados.
- O workbook de 06/08 contém uma ligação externa ao original no SharePoint da DCT: `BK_Reconciliação 2521251_STC 06_08_2026_AKZ.xlsx`.
- A cópia local `..._Diogo.xlsx` perdeu a folha `BL`, deixando `STC!I9` dependente dessa ligação externa.
- A tentativa read-only de consultar o original encontrou autenticação empresarial obrigatória. O conector disponível está associado a uma conta Microsoft pessoal e o browser não possui sessão empresarial activa.

O original SharePoint é agora a fonte adicional prioritária, pois pode preservar o balancete e outros artefactos removidos da cópia local.
