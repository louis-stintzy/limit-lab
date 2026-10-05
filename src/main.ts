import {
  testFiniteLimit,
  type FiniteLimitTestResult,
} from "./sequences/testFiniteLimit";
import { testFiniteLimitForEpsilons } from "./sequences/testFiniteLimitForEpsilons";

const sequence = (n: number): number => {
  return 2 + 1 / n ** 2;
};

function printFiniteLimitResult(
  title: string,
  result: FiniteLimitTestResult,
): void {
  console.log("=".repeat(60));
  console.log(title);
  console.log("=".repeat(60));

  console.log(`Limite conjecturée : ${result.limit}`);
  console.log(`epsilon : ${result.epsilon}`);
  console.log(`Intervalle : ]${result.lowerBound} ; ${result.upperBound}[`);
  console.log(`Testé jusqu'à n = ${result.testedUntil}`);
  console.log(`Statut : ${result.status}`);
  console.log(`Dernier n hors intervalle : ${result.lastOutsideN}`);
  console.log(`Rang candidat N : ${result.candidateN}`);

  console.log("\nPremiers termes capturés :");
  for (const term of result.capturedTerms) {
    console.log(
      `u(${term.n}) = ${term.value} | dedans ? ${term.isInside} | distance à la limite = ${term.distanceToLimit}`,
    );
  }

  console.log("\nPremiers termes hors de l'intervalle :");
  if (result.firstOutsideTerms.length === 0) {
    console.log("Aucun.");
  } else {
    for (const term of result.firstOutsideTerms) {
      console.log(
        `u(${term.n}) = ${term.value} | distance = ${term.distanceToLimit}`,
      );
    }
  }

  console.log("\nDerniers termes hors de l'intervalle :");
  if (result.lastOutsideTerms.length === 0) {
    console.log("Aucun.");
  } else {
    for (const term of result.lastOutsideTerms) {
      console.log(
        `u(${term.n}) = ${term.value} | distance = ${term.distanceToLimit}`,
      );
    }
  }

  console.log(
    "\n⚠️ Rappel : il s'agit d'un test numérique, pas d'une preuve mathématique.",
  );
  console.log("\n");
}

const correctResult = testFiniteLimit(sequence, 2, 0.01, 10_000, {
  captureTermsUpTo: 15,
  outsideExamplesCount: 5,
});

const wrongResult = testFiniteLimit(sequence, 2.5, 0.1, 10_000, {
  captureTermsUpTo: 15,
  outsideExamplesCount: 5,
});

printFiniteLimitResult("Test avec la bonne conjecture L = 2", correctResult);
printFiniteLimitResult("Test avec la mauvaise conjecture L = 2.5", wrongResult);

const epsilonTests = testFiniteLimitForEpsilons(
  sequence,
  2,
  [1, 0.1, 0.01, 0.001, 0.0001],
  100_000,
);

console.table(
  epsilonTests.results.map((result) => ({
    epsilon: result.epsilon,
    lowerBound: result.lowerBound,
    upperBound: result.upperBound,
    candidateN: result.candidateN,
    status: result.status,
  })),
);

const wrongEpsilonTests = testFiniteLimitForEpsilons(
  sequence,
  2.5,
  [1, 0.5, 0.25, 0.1, 0.01],
  100_000,
);

console.table(
  wrongEpsilonTests.results.map((result) => ({
    epsilon: result.epsilon,
    candidateN: result.candidateN,
    status: result.status,
  })),
);
