# Instruções permanentes — Reconciliação STC

## Arranque obrigatório

1. Trabalhar apenas no clone local `C:\Projetos\reconciliacao-stc`.
2. Nunca usar OneDrive como working tree. O OneDrive serve apenas para ficheiros externos.
3. Confirmar `.git`, remoto, branch, `git status` e sincronização antes de alterar.
4. Ler `PROJECT_STATE.md` e `docs/handover/NEXT_SESSION.md`.
5. Preservar alterações existentes e limitar o âmbito de cada tarefa.

## Fonte de verdade e continuidade

- GitHub (`dabranches-collab/reconciliacao-stc`) é a fonte oficial do código e da documentação.
- O repositório deve permitir continuar noutro computador ou agente sem histórico de conversa.
- Decisões permanentes, estado, backlog, testes e bloqueios relevantes devem ficar no Git.
- Não usar `git reset --hard`, force push ou reescrita destrutiva de histórico sem autorização explícita e necessidade demonstrada.

## Regras funcionais

- Não inventar regras contabilísticas STC.
- Os ficheiros STC e testes de reprodução são a fonte normativa das regras STC.
- Classificar regras como `CONFIRMADA`, `PROVÁVEL` ou `NÃO DETERMINADA`.
- Não promover uma regra provável a automática sem evidência e validação.
- Centralizar, versionar, documentar e testar regras aprovadas.
- Usar precisão monetária exacta; nunca decidir fecho com floating point JavaScript.
- Movimentos reconciliados não são apagados: saem do universo activo e permanecem consultáveis.
- Reabertura devolve os movimentos ao universo activo e recalcula os indicadores afectados.

## Experiência de utilização

- UX é requisito funcional: reduzir trabalho manual, risco e passos repetitivos.
- Determinar automaticamente conta, moeda, datas, período, sobreposição e continuidade quando os dados forem suficientes.
- Reconciliações determinísticas seguras são fechadas automaticamente e consultáveis por grupo.
- Casos fortes mas não determinísticos são propostas confirmáveis/rejeitáveis, com grupos expansíveis e acções em massa.
- `Por tratar` deve conter apenas excepções reais e favorecer pesquisa, filtros, selecção e exportação.
- Não implementar botões falsos, progresso fictício, zeros que signifiquem ausência de dados ou mensagens de erro genéricas.

## Referências externas

- `C:\Projetos\reconciliacao-emis` é referência read-only de arquitectura e UX, não de regras STC.
- `C:\Projetos\banckops-hub` é referência read-only de integração e identidade na primeira fase.
- A STC permanece uma aplicação independente. BankOps é launcher; não usar iframe, fusão de bases ou sessão partilhada sem nova decisão arquitectónica.

## Dados, segurança e base de dados

- Nunca versionar Excel reais, `.env`, passwords, tokens, chaves privadas ou `service_role`.
- Guardar migrations, RLS, functions, triggers e Edge Functions reproduzíveis no repositório.
- Nunca reescrever uma migration já aplicada; criar uma posterior.
- Tabelas expostas devem ter RLS e autorização efectiva, não apenas menus escondidos.
- Confirmar recursos Supabase/Cloudflare existentes antes de criar qualquer outro.

## Qualidade e conclusão

- Testar alterações em proporção ao risco, incluindo claro/escuro, resoluções relevantes e performance quando aplicável.
- Antes de concluir: rever diff e `git status`, actualizar estado, backlog e handover, e indicar testes e trabalho restante.
- Commits devem ser coerentes; não misturar documentação, schema, redesign e refactor global sem necessidade.
