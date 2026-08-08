# Reconciliação STC

Aplicação operacional exclusiva do Banco Keve para importar extractos STC, reconciliar automaticamente apenas o que regras demonstráveis permitirem e reduzir ao mínimo os movimentos que exigem tratamento humano. O catálogo de instituições identifica as contrapartes/fontes presentes nos dados, sem alterar a propriedade e identidade Keve da plataforma.

## Estado

O projecto está na fase de reverse engineering com uma fundação React/TypeScript já executável. A transição conhecida de 31/07/2026 para 06/08/2026 foi reproduzida linha a linha, mas ainda não existe evidência funcional para transformar o fecho manual observado numa regra automática.

## Desenvolvimento local

Requer Node.js e pnpm. Depois de instalar as dependências:

```powershell
pnpm test
pnpm build
pnpm dev
```

Os valores monetários do domínio usam `bigint` em cêntimos; não usar `number` para cálculos contabilísticos.

Ler por esta ordem:

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `docs/handover/NEXT_SESSION.md`
4. `docs/ANALISE_RECONCILIACAO_STC.md`
5. `ARCHITECTURE.md`
6. `docs/IDENTIDADE_BANCO_KEVE.md`

## Fontes externas

Os Excel reais permanecem fora do Git, na área OneDrive do utilizador. Nunca os copiar para o repositório ou commit sem validação explícita.

Referências read-only nesta fase:

- `C:\Projetos\reconciliacao-emis`
- `C:\Projetos\banckops-hub`

## Infraestrutura reservada

- GitHub: `dabranches-collab/reconciliacao-stc`
- Supabase: `nhcovhrogmwknhcecgpk`
- Cloudflare Worker: `reconciliacao-stc`

Não criar recursos duplicados. O Supabase e o Worker devem ser confirmados antes de qualquer alteração.
