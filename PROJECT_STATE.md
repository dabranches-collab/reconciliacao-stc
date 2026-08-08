# Estado actual do projecto

Actualizado em: 2026-08-07

## Resumo

- Repositório oficial clonado em `C:\Projetos\reconciliacao-stc`.
- O remoto estava vazio; esta fundação documental constitui o primeiro conteúdo local.
- Os três ficheiros STC foram analisados read-only e a transição 31/07 → 06/08 foi reproduzida a 100% por identidade de movimentos.
- Nenhuma regra contabilística automática foi implementada.
- Reconciliação EMIS e BankOps Hub foram analisados read-only.
- Fundação React 19, TypeScript e Vite criada, sem ligações fictícias nem regras de matching não demonstradas.
- Domínio monetário usa unidades mínimas inteiras (`bigint`) e a posição conhecida está coberta por seis testes automatizados.
- Primeira navegação operacional concluída: Painel, Importar, Reconciliação, Pendências, Reconciliados, Posição STC e Relatórios.
- Plataforma exclusiva do Banco Keve, com logótipo Keve sem assinatura no topo. O catálogo mantém Keve, BCI e futuras instituições apenas como fontes/contrapartes dos dados reconciliados.
- O ecrã de Reconciliação já demonstra selecção múltipla e soma exacta em tempo real com dados explicitamente marcados como amostra; exportação CSV da amostra é funcional.
- PWA preparada e validada localmente com manifest, ícone, service worker e cache de aplicação.
- Identidade PWA actualizada com símbolo sóbrio em cobre e castanho, círculo ampliado, transferências opostas e conciliação confirmada; SVG, PNG 192/512 e Apple Touch Icon gerados e validados localmente. Publicação desta revisão aguarda autorização explícita para republicar a aplicação completa.
- Ainda não existe URL pública: a publicação foi suspensa porque a interface contém totais financeiros reais e o endereço `workers.dev` seria público. Exige aprovação explícita dessa exposição ou remoção/protecção dos dados.
- Autenticação decidida: proprietário `dabranches`, apresentado como `Diogo Abranches`, login visível sem email e apenas por PIN, verificado no servidor com bloqueio e auditoria. Implementação descrita no ADR 0004; nenhum PIN foi criado ou armazenado.

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
- O resultado fechado divide-se em seis blocos sequenciais de soma zero: 5.938, 3.050, 2.802, 195, 2 e 2 movimentos.
- A hipótese de cutoff/FIFO simples foi rejeitada: as pendências de 06/08 estão intercaladas, embora preservem a ordem do extracto.
- O saldo contabilístico ligado em `STC!I9` é `-4.828.241.591,79` AOA, exactamente igual à soma dos 686 movimentos residuais; `STC!I13` é zero.

## Limite actual

Foram demonstrados seis grupos de saldo zero no resultado manual, mas não a regra segura de composição dos três grupos grandes. Número de operação, valor oposto e FIFO simples não explicam sozinhos o universo fechado. Não automatizar o fecho global apenas porque o bloco agregado soma zero.

## Infraestrutura

- Supabase `nhcovhrogmwknhcecgpk`: schema operacional aplicado com RLS e políticas de negação ao cliente; Security Advisor sem avisos.
- Carga inicial concluída: 686 pendências activas de 06/08/2026, saldo `-4.828.241.591,79` AOA, posição validada e seis resumos de grupos fechados (11.989 movimentos, saldo zero).
- O proprietário `dabranches` existe sem PIN configurado; nenhum acesso público foi activado.
- Gateway Worker implementado para login PIN, sessões `HttpOnly`, bloqueio progressivo, auditoria e leitura protegida da posição/movimentos; deployment dry-run aprovado.
- Frontend de produção já não contém totais financeiros embebidos: apresenta login e só carrega dados pela API depois de autenticar.
- Cloudflare Worker `reconciliacao-stc`: existe; código actual é apenas uma resposta `Hello world`.
- EMIS local: `main`, checkout preservado read-only; continha três commits locais à frente de `origin/main` no início da análise.
- BankOps local: clonado apenas para consulta read-only.

## Próximo marco

Obter o workbook original `BK_Reconciliação 2521251_STC 06_08_2026_AKZ.xlsx` no SharePoint da DCT, ou evidência equivalente, para ligar compensações agregadas às transferências/salários individuais e explicar exactamente quais movimentos de 06/08 entram no fecho. Só depois aprovar a primeira versão das regras automáticas.

## Verificação técnica mais recente

- `vitest`: 2 ficheiros, 6 testes aprovados.
- `tsc -b`: aprovado.
- `vite build`: aprovado; bundle principal 190,56 kB (60,23 kB gzip).
- Interface local validada no navegador: valores, contagens e estado de análise apresentados correctamente.
- Navegação e selecção de um grupo de três movimentos com soma `0,00 AOA` validadas no navegador.
