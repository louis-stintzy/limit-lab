import { testFiniteLimit } from "./sequences/testFiniteLimit";

const sequence = (n: number): number => {
  return 2 + 1 / n ** 2;
};

const result = testFiniteLimit(sequence, 2, 0.01, 10_000);

console.log(result);
