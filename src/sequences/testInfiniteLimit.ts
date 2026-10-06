import type { Sequence } from "./testFiniteLimit";

export type InfiniteLimitDirection = "positive" | "negative";

export type InfiniteLimitTestStatus =
  | "alwaysBeyondThreshold"
  | "candidateFoundWithinTestRange"
  | "noCandidateFoundWithinTestRange";

export type InfiniteLimitTestResult = {
  direction: InfiniteLimitDirection;
  threshold: number;

  status: InfiniteLimitTestStatus;

  testedUntil: number;
  lastOutsideN: number | null;
  candidateN: number | null;
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

  return {
    direction,
    threshold,
    status,
    testedUntil: maxN,
    lastOutsideN,
    candidateN,
  };
}
