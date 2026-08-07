# ADR 0004 — Proprietário com identificador e PIN

Estado: aceite para implementação

Data: 2026-08-07

## Decisão

- O primeiro utilizador e proprietário da plataforma terá o identificador único `dabranches` e o nome apresentado `Diogo Abranches`.
- O nome de utilizador, e não um email ou telefone, será apresentado e usado no fluxo de acesso.
- A credencial introduzida pelo utilizador será apenas um PIN numérico.
- O PIN nunca será guardado em texto, no frontend, no Git ou em metadados editáveis pelo utilizador.
- A verificação será executada no servidor, com hash lento, salt individual e segredo adicional fora da base de dados.
- Depois de cinco tentativas falhadas será aplicado bloqueio progressivo e auditável.
- A sessão será emitida em cookie `HttpOnly`, `Secure` e `SameSite=Strict`.
- O papel `owner` será informação de autorização controlada pelo servidor.

## Arquitectura

O Supabase Auth alojado não suporta directamente identificador arbitrário + PIN. Não será criado um email fictício para disfarçar essa limitação. O Cloudflare Worker será a fronteira de autenticação e API; o frontend não terá acesso a credenciais privilegiadas do Supabase.

## Provisionamento

O PIN inicial será definido num procedimento privado e local depois de o backend estar preparado. Não haverá PIN predefinido ou incluído em migrations.

## Consequências

- A aplicação não pode ser publicada com dados reais antes desta autenticação estar operacional e testada.
- Recuperação de acesso exige um procedimento administrativo seguro, não uma recuperação pública por email.
- Novos perfis futuros devem preservar separação entre autenticação, autorização e identidade apresentada.
