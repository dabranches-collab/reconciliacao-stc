import type { MinorUnits } from "./money";

export interface PositionSnapshot {
  movementCount: number;
  balance: MinorUnits;
}

export interface ReconciliationGroupEvidence {
  movementCount: number;
  balance: MinorUnits;
}

export interface TransitionEvidence {
  previousPending: PositionSnapshot;
  newMovements: PositionSnapshot;
  reconciled: PositionSnapshot;
  closingPending: PositionSnapshot;
  accountingBalance: MinorUnits;
  groups: ReconciliationGroupEvidence[];
}

export interface TransitionCheck {
  movementIdentityBalances: boolean;
  monetaryIdentityBalances: boolean;
  closingMatchesAccounting: boolean;
  everyGroupBalances: boolean;
  valid: boolean;
}

export function checkTransition(evidence: TransitionEvidence): TransitionCheck {
  const movementIdentityBalances =
    evidence.previousPending.movementCount + evidence.newMovements.movementCount ===
    evidence.reconciled.movementCount + evidence.closingPending.movementCount;
  const monetaryIdentityBalances =
    evidence.previousPending.balance + evidence.newMovements.balance ===
    evidence.reconciled.balance + evidence.closingPending.balance;
  const closingMatchesAccounting =
    evidence.closingPending.balance === evidence.accountingBalance;
  const everyGroupBalances = evidence.groups.every((group) => group.balance === 0n);

  return {
    movementIdentityBalances,
    monetaryIdentityBalances,
    closingMatchesAccounting,
    everyGroupBalances,
    valid:
      movementIdentityBalances &&
      monetaryIdentityBalances &&
      closingMatchesAccounting &&
      everyGroupBalances,
  };
}
