import { useEffect, useState } from "react";
import { formatMoney } from "./domain/money";

type View = "painel" | "importar" | "reconciliar" | "pendencias" | "reconciliados" | "posicao" | "relatorios";
type User = { username: string; display_name?: string; displayName?: string; role: string };
type Position = { position_date: string; previous_pending_count: number; new_movement_count: number; reconciled_count: number; closing_pending_count: number; accounting_balance_minor: number | string; closing_pending_balance_minor: number | string; difference_minor: number | string; status: string };
type Group = { sequence_number: number; movement_count: number; balance_minor: number | string; evidence_level: string };
type Movement = { id: string; movement_date: string; dc: string; amount_minor: number | string; operation: string; description: string; observation: string; document_number: string; state: string };

const views: { id: View; label: string; icon: string }[] = [
  { id: "painel", label: "Painel", icon: "▦" }, { id: "importar", label: "Importar", icon: "⇧" },
  { id: "reconciliar", label: "Reconciliação", icon: "⇄" }, { id: "pendencias", label: "Pendências", icon: "!" },
  { id: "reconciliados", label: "Reconciliados", icon: "✓" }, { id: "posicao", label: "Posição STC", icon: "◎" },
  { id: "relatorios", label: "Relatórios", icon: "▤" },
];

const money = (value: number | string | bigint) => formatMoney(BigInt(value));

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: "dabranches", pin }) }).catch(() => null);
    const data = await result?.json().catch(() => ({}));
    setBusy(false);
    if (!result?.ok) { setError(data?.error ?? "Não foi possível iniciar sessão."); return; }
    setPin(""); onLogin(data.user);
  }
  return <main className="login-page"><section className="login-card"><span className="keve-logo keve-logo-login"><img src="/institutions/keve/keve-logo-purple.png" alt="Keve" /></span><p className="eyebrow">PLATAFORMA DE RECONCILIAÇÃO STC</p><h1>Bem-vindo, Diogo</h1><p>Acesso reservado ao proprietário da plataforma Keve.</p><form onSubmit={submit}><label>Utilizador<input value="dabranches" disabled /></label><label>PIN<input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 12))} type="password" inputMode="numeric" autoComplete="current-password" minLength={6} required autoFocus /></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="primary" disabled={busy || pin.length < 6}>{busy ? "A validar…" : "Entrar"}</button></form><small>O PIN é verificado no servidor e nunca fica guardado neste dispositivo.</small></section></main>;
}

function MovementTable({ movements, selectable = false }: { movements: Movement[]; selectable?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  const total = movements.filter((item) => selected.includes(item.id)).reduce((sum, item) => sum + BigInt(item.amount_minor), 0n);
  return <><div className="table-tools"><div className="search">⌕ <input aria-label="Pesquisar movimentos" placeholder="Pesquisa será activada no próximo bloco" disabled /></div></div><div className="table-wrap"><table><thead><tr>{selectable && <th />}<th>Data</th><th>Operação</th><th>Descrição</th><th>Documento</th><th className="amount">Montante (AOA)</th></tr></thead><tbody>{movements.map((item) => <tr key={item.id}>{selectable && <td><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} aria-label={`Seleccionar ${item.id}`} /></td>}<td>{item.movement_date}</td><td>{item.operation}</td><td>{item.description}</td><td className="mono">{item.document_number || "—"}</td><td className={`amount ${BigInt(item.amount_minor) >= 0n ? "credit" : "debit"}`}>{money(item.amount_minor)}</td></tr>)}</tbody></table></div>{selectable && <div className="selection-bar"><span>{selected.length} seleccionados</span><strong>Soma: {formatMoney(total)} AOA</strong><span className={selected.length && total === 0n ? "balanced" : "muted"}>{selected.length && total === 0n ? "Grupo equilibrado" : "A soma deve ser zero"}</span></div>}</>;
}

function Workspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [view, setView] = useState<View>("painel");
  const [position, setPosition] = useState<Position | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  useEffect(() => { void fetch("/api/dashboard").then((r) => r.json()).then((data) => { setPosition(data.position); setGroups(data.groups ?? []); }); }, []);
  useEffect(() => { if (view === "pendencias" || view === "reconciliar") void fetch("/api/movements?limit=200").then((r) => r.json()).then((data) => setMovements(data.items ?? [])); }, [view]);
  if (!position) return <main className="loading">A carregar posição STC…</main>;
  const difference = BigInt(position.difference_minor);
  const heading = views.find((item) => item.id === view)?.label;
  let body: React.ReactNode;
  if (view === "painel") body = <><section className="page-heading"><div><p className="eyebrow">POSIÇÃO VALIDADA · {position.position_date}</p><h2>Visão geral</h2><p>A posição fecha exactamente com o saldo contabilístico.</p></div><button className="primary" onClick={() => setView("reconciliar")}>Trabalhar movimentos →</button></section><section className="metrics"><article><span>Universo de entrada</span><strong>{(position.previous_pending_count + position.new_movement_count).toLocaleString("pt-PT")}</strong><small>{position.previous_pending_count.toLocaleString("pt-PT")} anteriores + {position.new_movement_count.toLocaleString("pt-PT")} novos</small></article><article><span>Reconciliados</span><strong>{position.reconciled_count.toLocaleString("pt-PT")}</strong><small>Fora do motor activo</small></article><article><span>Por tratar</span><strong>{position.closing_pending_count.toLocaleString("pt-PT")}</strong><small>Movimentos activos</small></article><article className="success"><span>Diferença contabilística</span><strong>{money(difference)}</strong><small>Posição validada</small></article></section><section className="balance-card"><div><span>Saldo pendente</span><strong>{money(position.closing_pending_balance_minor)} <small>AOA</small></strong></div><div className="equals">=</div><div><span>Saldo contabilístico</span><strong>{money(position.accounting_balance_minor)} <small>AOA</small></strong></div><span className="checkmark">✓</span></section><section className="panel"><span className="kicker">HISTÓRICO MÍNIMO</span><h3>{groups.length} grupos fechados a zero</h3><div className="group-list">{groups.map((group) => <span key={group.sequence_number}>{group.movement_count.toLocaleString("pt-PT")}</span>)}</div></section></>;
  else if (view === "pendencias" || view === "reconciliar") body = <><section className="page-heading"><div><p className="eyebrow">UNIVERSO ACTIVO</p><h2>{heading}</h2><p>{position.closing_pending_count} pendências; são apresentadas 200 por página nesta primeira versão.</p></div></section><MovementTable movements={movements} selectable={view === "reconciliar"} /></>;
  else if (view === "posicao") body = <><section className="page-heading"><div><p className="eyebrow">FECHO · {position.position_date}</p><h2>Posição STC</h2></div></section><section className="equation"><div><span>Pendentes anteriores</span><strong>{position.previous_pending_count}</strong></div><b>+</b><div><span>Novos</span><strong>{position.new_movement_count}</strong></div><b>=</b><div><span>Reconciliados</span><strong>{position.reconciled_count}</strong></div><b>+</b><div><span>Pendentes finais</span><strong>{position.closing_pending_count}</strong></div></section></>;
  else body = <section className="panel empty"><span>•</span><h3>{heading}</h3><p>Este módulo será activado depois da publicação segura da posição inicial.</p></section>;
  return <div className="app-shell"><aside><div className="brand"><span className="keve-logo keve-logo-sidebar"><img src="/institutions/keve/keve-logo-green.png" alt="Keve" /></span></div><nav aria-label="Menu principal">{views.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label}{item.id === "pendencias" && <em>{position.closing_pending_count}</em>}</button>)}</nav><div className="side-foot"><strong>{user.display_name ?? user.displayName}</strong><small>Proprietário · @{user.username}</small><button onClick={onLogout}>Terminar sessão</button></div></aside><main><header><div><strong>{heading}</strong><small className="scope-label">Banco Keve · Reconciliação STC</small></div><span className="period">Posição: <b>{position.position_date}</b></span></header><div className="content">{body}</div></main></div>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { void fetch("/api/session").then(async (result) => { if (result.ok) setUser((await result.json()).user); }).finally(() => setChecking(false)); }, []);
  if (checking) return <main className="loading">A verificar sessão segura…</main>;
  if (!user) return <Login onLogin={setUser} />;
  return <Workspace user={user} onLogout={() => { setUser(null); void fetch("/api/logout", { method: "POST" }); }} />;
}
