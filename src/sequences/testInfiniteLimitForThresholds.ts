import type { Sequence } from "./testFiniteLimit";

import {
  testInfiniteLimit,
  type InfiniteLimitDirection,
  type InfiniteLimitTestResult,
} from "./testInfiniteLimit";

export type MultiThresholdTestResult = {
  direction: InfiniteLimitDirection;
  maxN: number;
  results: InfiniteLimitTestResult[];
};

export function testInfiniteLimitForThresholds(
  sequence: Sequence,
  direction: InfiniteLimitDirection,
  thresholds: number[],
  maxN: number,
): MultiThresholdTestResult {
  if (thresholds.length === 0) {
    throw new Error("La liste des seuils ne peut pas être vide.");
  }

  const results = thresholds.map((threshold) =>
    testInfiniteLimit(sequence, direction, threshold, maxN),
  );

  return {
    direction,
    maxN,
    results,
  };
}
