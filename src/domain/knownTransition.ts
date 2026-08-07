import { parseMoney } from "./money";
import type { TransitionEvidence } from "./position";

export const knownTransition: TransitionEvidence = {
  previousPending: {
    movementCount: 1_320,
    balance: parseMoney("-1744178093.94"),
  },
  newMovements: {
    movementCount: 11_355,
    balance: parseMoney("-3084063497.85"),
  },
  reconciled: {
    movementCount: 11_989,
    balance: 0n,
  },
  closingPending: {
    movementCount: 686,
    balance: parseMoney("-4828241591.79"),
  },
  accountingBalance: parseMoney("-4828241591.79"),
  groups: [5_938, 3_050, 2_802, 195, 2, 2].map((movementCount) => ({
    movementCount,
    balance: 0n,
  })),
};
