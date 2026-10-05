export type Sequence = (n: number) => number;

export type TestedTerm = {
  n: number;
  value: number;
  isInside: boolean;
  distanceToLimit: number;
};

export type FiniteLimitTestStatus =
  | "alwaysInsideTestRange"
  | "candidateFoundWithinTestRange"
  | "noCandidateFoundWithinTestRange";

export type TestFiniteLimitOptions = {
  captureTermsUpTo?: number;
  outsideExamplesCount?: number;
};

export type FiniteLimitTestResult = {
  status: FiniteLimitTestStatus;

  limit: number;
  epsilon: number;

  lowerBound: number;
  upperBound: number;

  testedUntil: number;

  lastOutsideN: number | null;
  candidateN: number | null;

  capturedTerms: TestedTerm[];
  firstOutsideTerms: TestedTerm[];
  lastOutsideTerms: TestedTerm[];
};

export function testFiniteLimit(
  sequence: Sequence,
  limit: number,
  epsilon: number,
  maxN: number,
  options: TestFiniteLimitOptions = {},
): FiniteLimitTestResult {
  if (epsilon <= 0) {
    throw new Error("epsilon doit être strictement positif.");
  }

  if (!Number.isInteger(maxN) || maxN < 1) {
    throw new Error("maxN doit être un entier supérieur ou égal à 1.");
  }

  const captureTermsUpTo = options.captureTermsUpTo ?? 20;
  const outsideExamplesCount = options.outsideExamplesCount ?? 5;

  const lowerBound = limit - epsilon;
  const upperBound = limit + epsilon;

  let lastOutsideN: number | null = null;

  const capturedTerms: TestedTerm[] = [];
  const outsideTerms: TestedTerm[] = [];

  for (let n = 1; n <= maxN; n++) {
    const value = sequence(n);
    const isInside = value > lowerBound && value < upperBound;
    const distanceToLimit = Math.abs(value - limit);

    const testedTerm: TestedTerm = {
      n,
      value,
      isInside,
      distanceToLimit,
    };

    if (n <= captureTermsUpTo) {
      capturedTerms.push(testedTerm);
    }

    if (!isInside) {
      lastOutsideN = n;
      outsideTerms.push(testedTerm);
    }
  }

  let status: FiniteLimitTestStatus;
  let candidateN: number | null;

  if (lastOutsideN === null) {
    status = "alwaysInsideTestRange";
    candidateN = 1;
  } else if (lastOutsideN < maxN) {
    status = "candidateFoundWithinTestRange";
    candidateN = lastOutsideN + 1;
  } else {
    status = "noCandidateFoundWithinTestRange";
    candidateN = null;
  }

  return {
    status,
    limit,
    epsilon,
    lowerBound,
    upperBound,
    testedUntil: maxN,
    lastOutsideN,
    candidateN,
    capturedTerms,
    firstOutsideTerms: outsideTerms.slice(0, outsideExamplesCount),
    lastOutsideTerms: outsideTerms.slice(-outsideExamplesCount),
  };
}
