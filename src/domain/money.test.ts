import { describe, expect, it } from "vitest";
import { formatMoney, parseMoney, sumMoney } from "./money";

describe("money", () => {
  it("converte montantes em unidades mínimas exactas", () => {
    expect(parseMoney("-4 828 241 591,79")).toBe(-482_824_159_179n);
    expect(parseMoney("0.01")).toBe(1n);
  });

  it("soma sem floating point", () => {
    expect(sumMoney([parseMoney("0.10"), parseMoney("0.20")])).toBe(30n);
  });

  it("formata valores AOA", () => {
    expect(formatMoney(-482_824_159_179n)).toBe("-4.828.241.591,79");
  });
});
