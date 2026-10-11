import type { Sequence } from "./testFiniteLimit";

export type InfiniteLimitDirection = "positive" | "negative";

export type InfiniteLimitTestStatus =
  | "alwaysBeyondThreshold"
  | "candidateFoundWithinTestRange"
  | "noCandidateFoundWithinTestRange";

export type InfiniteLimitTestedTerm = {
  n: number;
  value: number;
  isBeyondThreshold: boolean;
  marginToThreshold: number;
};

export type InfiniteLimitTestResult = {
  direction: InfiniteLimitDirection;
  threshold: number;

  status: InfiniteLimitTestStatus;

  testedUntil: number;
  lastOutsideN: number | null;
  candidateN: number | null;

  sampledTerms: InfiniteLimitTestedTerm[];
};

export function testInfiniteLimit(
  sequence: Sequence,
  direction: InfiniteLimitDirection,
  threshold: number,
  maxN: number,
): InfiniteLimitTestResult {
  if (!Number.isFinite(threshold)) {
    throw new Error("Le seuil A doit être un nombre réel fini.");
  }

  if (!Number.isSafeInteger(maxN) || maxN < 1) {
    throw new Error("maxN doit être un entier positif.");
  }

  let lastOutsideN: number | null = null;

  for (let n = 1; n <= maxN; n++) {
    const value = sequence(n);

    if (!Number.isFinite(value)) {
      throw new Error(`u(${n}) n'est pas un nombre fini.`);
    }

    const isBeyondThreshold =
      direction === "positive" ? value > threshold : value < threshold;

    if (!isBeyondThreshold) {
      lastOutsideN = n;
    }
  }

  let status: InfiniteLimitTestStatus;
  let candidateN: number | null;

  if (lastOutsideN === null) {
    status = "alwaysBeyondThreshold";
    candidateN = 1;
  } else if (lastOutsideN < maxN) {
    status = "candidateFoundWithinTestRange";
    candidateN = lastOutsideN + 1;
  } else {
    status = "noCandidateFoundWithinTestRange";

    candidateN = null;
  }

  const sampledIndexes = buildSampleIndexes(candidateN, maxN);

  const sampledTerms = sampledIndexes.map((n) =>
    createTestedTerm(sequence, n, direction, threshold),
  );

  return {
    direction,
    threshold,
    status,
    testedUntil: maxN,
    lastOutsideN,
    candidateN,
    sampledTerms,
  };
}

function createTestedTerm(
  sequence: Sequence,
  n: number,
  direction: InfiniteLimitDirection,
  threshold: number,
): InfiniteLimitTestedTerm {
  const value = sequence(n);

  const isBeyondThreshold =
    direction === "positive" ? value > threshold : value < threshold;

  const marginToThreshold =
    direction === "positive" ? value - threshold : threshold - value;

  return {
    n,
    value,
    isBeyondThreshold,
    marginToThreshold,
  };
}

function buildSampleIndexes(candidateN: number | null, maxN: number): number[] {
  const indexes = new Set<number>();

  // Quelques premiers termes.
  for (let n = 1; n <= Math.min(8, maxN); n++) {
    indexes.add(n);
  }

  if (candidateN !== null) {
    // Quelques termes autour du rang candidat.
    for (
      let n = Math.max(1, candidateN - 3);
      n <= Math.min(maxN, candidateN + 3);
      n++
    ) {
      indexes.add(n);
    }
  } else {
    // Si aucun rang candidat n'a été trouvé,
    // on regarde également la fin de la zone testée.
    for (let n = Math.max(1, maxN - 4); n <= maxN; n++) {
      indexes.add(n);
    }
  }

  return [...indexes].sort((a, b) => a - b);
}
