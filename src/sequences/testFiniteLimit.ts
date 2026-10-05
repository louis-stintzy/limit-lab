export type Sequence = (n: number) => number;

export type FiniteLimitTestResult = {
  limit: number;
  epsilon: number;

  lowerBound: number;
  upperBound: number;

  lastOutsideN: number | null;
  candidateN: number;

  testedUntil: number;
};

export function testFiniteLimit(
  sequence: Sequence,
  limit: number,
  epsilon: number,
  maxN: number,
): FiniteLimitTestResult {
  if (epsilon <= 0) {
    throw new Error("epsilon doit être strictement positif.");
  }

  if (!Number.isInteger(maxN) || maxN < 1) {
    throw new Error("maxN doit être un entier supérieur ou égal à 1.");
  }

  const lowerBound = limit - epsilon;
  const upperBound = limit + epsilon;

  let lastOutsideN: number | null = null;

  for (let n = 1; n <= maxN; n++) {
    const value = sequence(n);

    const isInside = value > lowerBound && value < upperBound;

    if (!isInside) {
      lastOutsideN = n;
    }
  }

  const candidateN = lastOutsideN === null ? 1 : lastOutsideN + 1;

  return {
    limit,
    epsilon,
    lowerBound,
    upperBound,
    lastOutsideN,
    candidateN,
    testedUntil: maxN,
  };
}
