import { formatMoney } from "./domain/money";
import { knownTransition } from "./domain/knownTransition";
import { checkTransition } from "./domain/position";

const check = checkTransition(knownTransition);

export default function App() {
  return (
    <main>
      <header>
        <span className="brand-mark" aria-hidden="true" />
        <div>
          <p>Banco Keve · BankOps</p>
          <h1>Reconciliação STC</h1>
        </div>
        <span className="phase">Fase de análise</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">POSIÇÃO CONHECIDA · 06/08/2026</p>
          <h2>O residual coincide exactamente com a contabilidade.</h2>
          <p>
            A fundação técnica valida as invariantes confirmadas sem automatizar
            regras de matching ainda não demonstradas.
          </p>
        </div>
        <strong>{formatMoney(knownTransition.accountingBalance)} <small>AOA</small></strong>
      </section>

      <section className="metrics" aria-label="Resumo da transição conhecida">
        <article><span>Universo activo</span><strong>12.675</strong><small>1.320 anteriores + 11.355 novos</small></article>
        <article><span>Reconciliados</span><strong>11.989</strong><small>Seis grupos com saldo zero</small></article>
        <article><span>Por tratar</span><strong>686</strong><small>Saldo igual à contabilidade</small></article>
        <article className="success"><span>Validação</span><strong>{check.valid ? "Exacta" : "Rever"}</strong><small>Contagens e montantes fecham</small></article>
      </section>

      <section className="notice">
        <div><span>✓</span><div><strong>Fundação validada</strong><p>Precisão monetária inteira e testes da posição conhecida.</p></div></div>
        <p>Importação e reconciliação automática serão activadas apenas depois da aprovação das regras STC.</p>
      </section>
    </main>
  );
}
