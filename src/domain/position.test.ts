import { describe, expect, it } from "vitest";
import { knownTransition } from "./knownTransition";
import { checkTransition } from "./position";

describe("transição conhecida 31/07 → 06/08", () => {
  it("fecha todas as invariantes confirmadas", () => {
    expect(checkTransition(knownTransition)).toEqual({
      movementIdentityBalances: true,
      monetaryIdentityBalances: true,
      closingMatchesAccounting: true,
      everyGroupBalances: true,
      valid: true,
    });
  });

  it("rejeita um residual que não coincide com a contabilidade", () => {
    const invalid = {
      ...knownTransition,
      accountingBalance: knownTransition.accountingBalance + 1n,
    };
    expect(checkTransition(invalid).valid).toBe(false);
    expect(checkTransition(invalid).closingMatchesAccounting).toBe(false);
  });

  it("confirma que os seis grupos cobrem todos os reconciliados", () => {
    const grouped = knownTransition.groups.reduce(
      (total, group) => total + group.movementCount,
      0,
    );
    expect(grouped).toBe(knownTransition.reconciled.movementCount);
  });
});
