import { useMemo, useState } from "react";
import { formatMoney, parseMoney, sumMoney } from "./domain/money";
import { knownTransition } from "./domain/knownTransition";
import { checkTransition } from "./domain/position";

type View = "painel" | "importar" | "reconciliar" | "pendencias" | "reconciliados" | "posicao" | "relatorios";
type Movement = { id: string; date: string; operation: string; description: string; amount: bigint; status: "Pendente" | "Proposta" };

const views: { id: View; label: string; icon: string }[] = [
  { id: "painel", label: "Painel", icon: "▦" }, { id: "importar", label: "Importar", icon: "⇧" },
  { id: "reconciliar", label: "Reconciliação", icon: "⇄" }, { id: "pendencias", label: "Pendências", icon: "!" },
  { id: "reconciliados", label: "Reconciliados", icon: "✓" }, { id: "posicao", label: "Posição STC", icon: "◎" },
  { id: "relatorios", label: "Relatórios", icon: "▤" },
];

const movements: Movement[] = [
  { id: "STC-0608-01142", date: "06/08/2026", operation: "RCT", description: "STC — Compensação RCT", amount: parseMoney("-18504231.20"), status: "Pendente" },
  { id: "STC-0608-03518", date: "06/08/2026", operation: "TRF", description: "Transferência interbancária", amount: parseMoney("12500000"), status: "Proposta" },
  { id: "STC-0608-03519", date: "06/08/2026", operation: "TRF", description: "Transferência interbancária", amount: parseMoney("6004231.20"), status: "Proposta" },
  { id: "STC-0608-05201", date: "06/08/2026", operation: "ICX", description: "Operação ICX", amount: parseMoney("-875000"), status: "Pendente" },
  { id: "STC-0608-05202", date: "06/08/2026", operation: "ICX", description: "Operação ICX", amount: parseMoney("875000"), status: "Proposta" },
];

const check = checkTransition(knownTransition);

function downloadCsv(rows: Movement[]) {
  const csv = ["id;data;operacao;descricao;montante;estado", ...rows.map((m) => [m.id, m.date, m.operation, m.description, formatMoney(m.amount), m.status].join(";"))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "stc-amostra.csv"; link.click(); URL.revokeObjectURL(url);
}

function MovementTable({ selectable = false }: { selectable?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  const total = useMemo(() => sumMoney(movements.filter((m) => selected.includes(m.id)).map((m) => m.amount)), [selected]);
  return <>
    <div className="table-tools"><div className="search">⌕ <input aria-label="Pesquisar movimentos" placeholder="Pesquisar referência, operação ou valor" /></div><button onClick={() => downloadCsv(movements)}>Exportar CSV</button></div>
    <div className="table-wrap"><table><thead><tr>{selectable && <th aria-label="Selecção" />}<th>Referência</th><th>Data</th><th>Operação</th><th>Descrição</th><th>Estado</th><th className="amount">Montante (AOA)</th></tr></thead>
      <tbody>{movements.map((m) => <tr key={m.id}>{selectable && <td><input type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected((s) => s.includes(m.id) ? s.filter((id) => id !== m.id) : [...s, m.id])} aria-label={`Seleccionar ${m.id}`} /></td>}<td className="mono">{m.id}</td><td>{m.date}</td><td>{m.operation}</td><td>{m.description}</td><td><span className={`status ${m.status === "Proposta" ? "proposal" : ""}`}>{m.status}</span></td><td className={`amount ${m.amount > 0 ? "credit" : "debit"}`}>{formatMoney(m.amount)}</td></tr>)}</tbody></table></div>
    {selectable && <div className="selection-bar"><span>{selected.length} seleccionados</span><strong>Soma: {formatMoney(total)} AOA</strong><span className={total === 0n && selected.length ? "balanced" : "muted"}>{total === 0n && selected.length ? "Grupo equilibrado" : "A soma deve ser zero"}</span></div>}
  </>;
}

function Dashboard({ navigate }: { navigate: (view: View) => void }) {
  return <><section className="page-heading"><div><p className="eyebrow">POSIÇÃO CONHECIDA · 06/08/2026</p><h2>Visão geral</h2><p>A posição fecha exactamente com o saldo contabilístico.</p></div><button className="primary" onClick={() => navigate("reconciliar")}>Trabalhar movimentos →</button></section>
    <section className="metrics"><article><span>Universo activo</span><strong>12.675</strong><small>1.320 anteriores + 11.355 novos</small></article><article><span>Reconciliados</span><strong>11.989</strong><small>94,59% do universo</small></article><article><span>Por tratar</span><strong>686</strong><small>Movimentos em aberto</small></article><article className="success"><span>Diferença contabilística</span><strong>{check.valid ? "0,00" : "Rever"}</strong><small>Posição validada</small></article></section>
    <section className="balance-card"><div><span>Saldo pendente</span><strong>{formatMoney(knownTransition.closingPending.balance)} <small>AOA</small></strong></div><div className="equals">=</div><div><span>Saldo contabilístico</span><strong>{formatMoney(knownTransition.accountingBalance)} <small>AOA</small></strong></div><span className="checkmark">✓</span></section>
    <section className="split"><article className="panel"><div className="panel-title"><div><span className="kicker">ATENÇÃO OPERACIONAL</span><h3>686 movimentos aguardam tratamento</h3></div><button onClick={() => navigate("pendencias")}>Abrir pendências</button></div><p>Todos são movimentos novos de 06/08/2026 e permanecem no universo activo.</p></article><article className="panel"><span className="kicker">COBERTURA CONHECIDA</span><h3>6 grupos fechados a zero</h3><div className="group-list">{[5938,3050,2802,195,2,2].map((n,i)=><span key={i}>{n.toLocaleString("pt-PT")}</span>)}</div></article></section></>;
}

function AppView({ view, navigate }: { view: View; navigate: (view: View) => void }) {
  if (view === "painel") return <Dashboard navigate={navigate} />;
  if (view === "importar") return <><section className="page-heading"><div><p className="eyebrow">ENTRADA CONTROLADA</p><h2>Importar movimentos</h2><p>Analise o ficheiro antes de o integrar na posição activa.</p></div></section><section className="dropzone"><span>⇧</span><h3>Seleccione um ficheiro STC</h3><p>Excel ou CSV · o ficheiro não será integrado sem validação explícita.</p><label className="primary">Escolher ficheiro<input type="file" accept=".xlsx,.xls,.csv" /></label></section><section className="split"><article className="panel"><span className="kicker">MODO 1</span><h3>Analisar apenas</h3><p>Detecta estrutura, período, duplicados e sobreposição sem alterar a posição.</p></article><article className="panel"><span className="kicker">MODO 2</span><h3>Integrar na reconciliação</h3><p>Disponível depois de a análise do ficheiro passar todas as validações.</p></article></section></>;
  if (view === "posicao") return <><section className="page-heading"><div><p className="eyebrow">FECHO · 06/08/2026</p><h2>Posição STC</h2><p>Equação completa da transição e controlo contabilístico.</p></div></section><section className="equation"><div><span>Pendentes anteriores</span><strong>1.320</strong></div><b>+</b><div><span>Novos movimentos</span><strong>11.355</strong></div><b>=</b><div><span>Reconciliados</span><strong>11.989</strong></div><b>+</b><div><span>Pendentes finais</span><strong>686</strong></div></section><section className="balance-card"><div><span>Residual</span><strong>{formatMoney(knownTransition.closingPending.balance)} <small>AOA</small></strong></div><div className="equals">−</div><div><span>Contabilidade</span><strong>{formatMoney(knownTransition.accountingBalance)} <small>AOA</small></strong></div><span className="zero">0,00</span></section></>;
  if (view === "relatorios") return <><section className="page-heading"><div><p className="eyebrow">SAÍDAS</p><h2>Relatórios</h2><p>Exporte informação filtrada e rastreável.</p></div></section><section className="report-grid">{["Posição STC", "Pendências", "Grupos reconciliados", "Movimentos da amostra"].map((name, i)=><article className="panel" key={name}><span className="report-icon">▤</span><h3>{name}</h3><p>{i === 3 ? "Amostra visível no ecrã de trabalho." : "Disponível quando a fonte operacional estiver integrada."}</p>{i === 3 && <button onClick={() => downloadCsv(movements)}>Exportar CSV</button>}</article>)}</section></>;
  const titles = view === "reconciliar" ? ["Reconciliação", "Seleccione movimentos e confirme grupos cuja soma seja exactamente zero."] : view === "pendencias" ? ["Pendências", "Movimentos que continuam no universo activo e exigem tratamento."] : ["Reconciliados", "Histórico consultável dos movimentos fechados por grupo."];
  return <><section className="page-heading"><div><p className="eyebrow">ÁREA DE TRABALHO · DADOS DE AMOSTRA</p><h2>{titles[0]}</h2><p>{titles[1]}</p></div></section>{view === "reconciliados" ? <section className="panel empty"><span>✓</span><h3>11.989 movimentos reconciliados</h3><p>O detalhe integral será carregado quando a fonte de dados for integrada. Os seis grupos conhecidos fecham a zero.</p></section> : <MovementTable selectable={view === "reconciliar"} />}</>;
}

export default function App() {
  const [view, setView] = useState<View>("painel");
  return <div className="app-shell"><aside><div className="brand"><span className="brand-mark" /><div><small>O BANCO QUE AVANÇA</small><strong>Reconciliação STC</strong></div></div><nav aria-label="Menu principal">{views.map((item)=><button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label}{item.id === "pendencias" && <em>686</em>}</button>)}</nav><div className="side-foot"><span className="dot" /> Fase de análise<small>Sem backend ligado</small></div></aside><main><header><div><span className="mobile-mark brand-mark" /><strong>{views.find((item)=>item.id === view)?.label}</strong></div><span className="period">Banco Keve · Posição: <b>06/08/2026</b></span></header><div className="content"><AppView view={view} navigate={setView} /></div></main></div>;
}
