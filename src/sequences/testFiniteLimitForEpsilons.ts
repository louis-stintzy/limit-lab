import {
  testFiniteLimit,
  type Sequence,
  type FiniteLimitTestResult,
} from "./testFiniteLimit";

export type MultiEpsilonTestResult = {
  limit: number;
  maxN: number;
  results: FiniteLimitTestResult[];
};

export function testFiniteLimitForEpsilons(
  sequence: Sequence,
  limit: number,
  epsilons: number[],
  maxN: number,
): MultiEpsilonTestResult {
  if (epsilons.length === 0) {
    throw new Error("La liste des epsilon ne peut pas être vide.");
  }

  const results = epsilons.map((epsilon) =>
    testFiniteLimit(sequence, limit, epsilon, maxN, {
      captureTermsUpTo: 0,
      outsideExamplesCount: 0,
    }),
  );

  return {
    limit,
    maxN,
    results,
  };
}
