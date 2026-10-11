import "./style.css";

import { createSequenceFromExpression } from "./math/createSequenceFromExpression";
import { testFiniteLimit } from "./sequences/testFiniteLimit";
import { testInfiniteLimit } from "./sequences/testInfiniteLimit";

type LimitType = "finite" | "positiveInfinity" | "negativeInfinity";

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Élément #${id} introuvable.`);
  }

  return element as T;
}

const form = getElement<HTMLFormElement>("limit-form");

const expressionInput = getElement<HTMLInputElement>("sequence-expression");

const limitTypeSelect = getElement<HTMLSelectElement>("limit-type");

const finiteFields = getElement<HTMLDivElement>("finite-fields");

const infiniteFields = getElement<HTMLDivElement>("infinite-fields");

const limitValueInput = getElement<HTMLInputElement>("limit-value");

const epsilonInput = getElement<HTMLInputElement>("epsilon");

const thresholdInput = getElement<HTMLInputElement>("threshold");

const maxNInput = getElement<HTMLInputElement>("max-n");

const resultSection = getElement<HTMLElement>("result");

limitTypeSelect.addEventListener("change", () => {
  const limitType = limitTypeSelect.value as LimitType;

  const isFinite = limitType === "finite";

  finiteFields.hidden = !isFinite;
  infiniteFields.hidden = isFinite;
});

function renderFiniteTermsTable(
  terms: {
    n: number;
    value: number;
    isInside: boolean;
    distanceToLimit: number;
  }[],
): string {
  if (terms.length === 0) {
    return "<p>Aucun terme à afficher.</p>";
  }

  const rows = terms
    .map(
      (term) => `
        <tr>
          <td>${term.n}</td>
          <td>${term.value.toFixed(8)}</td>
          <td>${term.distanceToLimit.toFixed(8)}</td>
          <td class="${term.isInside ? "term-valid" : "term-invalid"}">
            ${term.isInside ? "✓" : "✗"}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="terms-table-wrapper">
      <table class="terms-table">
        <thead>
          <tr>
            <th>n</th>
            <th>u(n)</th>
            <th>|u(n) - L|</th>
            <th>Dans l'intervalle ?</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// ----- Traitement d'une limite finie ------

function runFiniteLimitTest(expression: string, maxN: number): void {
  const limit = Number(limitValueInput.value);

  const epsilon = Number(epsilonInput.value);

  const sequence = createSequenceFromExpression(expression);

  const result = testFiniteLimit(sequence, limit, epsilon, maxN, {
    captureTermsUpTo: 30,
    outsideExamplesCount: 5,
  });

  const candidateText =
    result.candidateN === null
      ? "Aucun rang candidat trouvé."
      : `Rang candidat : N = ${result.candidateN}`;

  resultSection.innerHTML = `
  <h2>Résultat</h2>

  <div class="result-summary">
    <div>
      <span>Suite</span>
      <strong>u(n) = ${expression}</strong>
    </div>

    <div>
      <span>Limite conjecturée</span>
      <strong>${limit}</strong>
    </div>

    <div>
      <span>ε</span>
      <strong>${epsilon}</strong>
    </div>

    <div>
      <span>Intervalle</span>
      <strong>]${result.lowerBound} ; ${result.upperBound}[</strong>
    </div>

    <div>
      <span>Rang candidat</span>
      <strong>
        ${result.candidateN === null ? "Aucun" : `N = ${result.candidateN}`}
      </strong>
    </div>

    <div>
      <span>Test effectué jusqu'à</span>
      <strong>n = ${result.testedUntil}</strong>
    </div>
  </div>

  <h3>Premiers termes de la suite</h3>

  ${renderFiniteTermsTable(result.capturedTerms)}

  <p class="numeric-warning">
    ⚠ Test numérique : ce résultat ne constitue pas une preuve mathématique.
  </p>
`;
}

// ----- Traitement de \(+\infty\) et \(-\infty\) -----

function runInfiniteLimitTest(
  expression: string,
  maxN: number,
  limitType: LimitType,
): void {
  const threshold = Number(thresholdInput.value);

  const sequence = createSequenceFromExpression(expression);

  const direction = limitType === "positiveInfinity" ? "positive" : "negative";

  const result = testInfiniteLimit(sequence, direction, threshold, maxN);

  const symbol = direction === "positive" ? "+∞" : "-∞";

  const inequality =
    direction === "positive" ? `u(n) > ${threshold}` : `u(n) < ${threshold}`;

  const candidateText =
    result.candidateN === null
      ? "Aucun rang candidat trouvé."
      : `Rang candidat : N = ${result.candidateN}`;

  resultSection.innerHTML = `
    <h2>Résultat</h2>

    <p>
      Suite :
      <strong>u(n) = ${expression}</strong>
    </p>

    <p>
      Limite conjecturée :
      <strong>${symbol}</strong>
    </p>

    <p>
      Seuil A = ${threshold}
    </p>

    <p>
      Condition recherchée :
      <strong>${inequality}</strong>
    </p>

    <p>
      ${candidateText}
    </p>

    <p>
      Test effectué jusqu'à
      n = ${result.testedUntil}.
    </p>

    <p>
      <strong>
        ⚠ Ceci est un test numérique,
        pas une preuve mathématique.
      </strong>
    </p>
  `;
}

// ----- Soumission du formulaire -----

form.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const expression = expressionInput.value.trim();

    const maxN = Number(maxNInput.value);

    const limitType = limitTypeSelect.value as LimitType;

    if (!Number.isSafeInteger(maxN) || maxN < 1) {
      throw new Error("Le rang maximal doit être un entier positif.");
    }

    if (limitType === "finite") {
      runFiniteLimitTest(expression, maxN);
    } else {
      runInfiniteLimitTest(expression, maxN, limitType);
    }

    resultSection.hidden = false;
  } catch (error) {
    resultSection.hidden = false;

    resultSection.innerHTML = `
        <h2>Erreur</h2>

        <p>
          ${
            error instanceof Error
              ? error.message
              : "Une erreur inconnue est survenue."
          }
        </p>
      `;
  }
});
