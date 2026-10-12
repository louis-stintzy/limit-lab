import "./style.css";

import { createSequenceFromExpression } from "./math/createSequenceFromExpression";
import { testFiniteLimit } from "./sequences/testFiniteLimit";
import { testInfiniteLimit } from "./sequences/testInfiniteLimit";
import type {
  InfiniteLimitDirection,
  InfiniteLimitTestedTerm,
} from "./sequences/testInfiniteLimit";
import { testFiniteLimitForEpsilons } from "./sequences/testFiniteLimitForEpsilons";
import type { FiniteLimitTestResult } from "./sequences/testFiniteLimit";
import { testInfiniteLimitForThresholds } from "./sequences/testInfiniteLimitForThresholds";
import type { InfiniteLimitTestResult } from "./sequences/testInfiniteLimit";

import {
  renderFiniteSequenceChart,
  renderInfiniteSequenceChart,
} from "./chart/sequenceChart";

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

const finiteMultiFields = getElement<HTMLDivElement>("finite-multi-fields");

const infiniteMultiFields = getElement<HTMLDivElement>("infinite-multi-fields");

const epsilonListInput = getElement<HTMLInputElement>("epsilon-list");

const thresholdListInput = getElement<HTMLInputElement>("threshold-list");

const resultSection = getElement<HTMLElement>("result");

limitTypeSelect.addEventListener("change", () => {
  const limitType = limitTypeSelect.value as LimitType;

  const isFinite = limitType === "finite";

  finiteFields.hidden = !isFinite;
  infiniteFields.hidden = isFinite;

  finiteMultiFields.hidden = !isFinite;
  infiniteMultiFields.hidden = isFinite;

  if (limitType === "positiveInfinity") {
    thresholdListInput.value = "1, 10, 100, 1000";
  }

  if (limitType === "negativeInfinity") {
    thresholdListInput.value = "-1, -10, -100, -1000";
  }
});

function parseNumberList(value: string): number[] {
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map(Number);

  if (values.length === 0) {
    throw new Error("La liste de valeurs ne peut pas être vide.");
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("Toutes les valeurs doivent être des nombres valides.");
  }

  return values;
}

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

function renderInfiniteTermsTable(
  terms: InfiniteLimitTestedTerm[],
  direction: InfiniteLimitDirection,
  threshold: number,
): string {
  if (terms.length === 0) {
    return "<p>Aucun terme à afficher.</p>";
  }

  const condition =
    direction === "positive" ? `u(n) > ${threshold}` : `u(n) < ${threshold}`;

  const rows = terms
    .map(
      (term) => `
        <tr>
          <td>${term.n}</td>

          <td>
            ${term.value.toFixed(8)}
          </td>

          <td>
            ${term.marginToThreshold.toFixed(8)}
          </td>

          <td
            class="${term.isBeyondThreshold ? "term-valid" : "term-invalid"}"
          >
            ${term.isBeyondThreshold ? "✓" : "✗"}
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
            <th>Marge au seuil</th>
            <th>${condition}</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderMultiEpsilonTable(results: FiniteLimitTestResult[]): string {
  const rows = results
    .map(
      (result) => `
        <tr
          class="clickable-row"
          data-epsilon="${result.epsilon}"
          data-candidate-n="${result.candidateN ?? ""}"
        >
          <td>${result.epsilon}</td>

          <td>
            ]${result.lowerBound} ;
            ${result.upperBound}[
          </td>

          <td>
            ${result.candidateN === null ? "—" : result.candidateN}
          </td>

          <td>
            ${result.candidateN === null ? "✗" : "✓"}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="multi-test-result">
      <h3>Analyse avec plusieurs ε</h3>

      <table class="terms-table" id="multi-epsilon-table">
        <thead>
          <tr>
            <th>ε</th>
            <th>Intervalle</th>
            <th>N candidat</th>
            <th>Résultat</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderMultiThresholdTable(
  results: InfiniteLimitTestResult[],
  direction: InfiniteLimitDirection,
): string {
  const conditionSymbol = direction === "positive" ? ">" : "<";

  const rows = results
    .map(
      (result) => `
        <tr
          class="clickable-row"
          data-threshold="${result.threshold}"
          data-candidate-n="${result.candidateN ?? ""}"
        >
          <td>${result.threshold}</td>

          <td>
            u(n) ${conditionSymbol}
            ${result.threshold}
          </td>

          <td>
            ${result.candidateN === null ? "—" : result.candidateN}
          </td>

          <td>
            ${result.candidateN === null ? "✗" : "✓"}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="multi-test-result">
      <h3>Analyse avec plusieurs seuils A</h3>

      <table class="terms-table" id="multi-threshold-table">
        <thead>
          <tr>
            <th>A</th>
            <th>Condition</th>
            <th>N candidat</th>
            <th>Résultat</th>
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
    captureTermsUpTo: 20,
    outsideExamplesCount: 5,
  });

  const epsilons = parseNumberList(epsilonListInput.value);

  if (epsilons.some((epsilon) => epsilon <= 0)) {
    throw new Error(
      "Toutes les valeurs de ε doivent être strictement positives.",
    );
  }

  const multiResult = testFiniteLimitForEpsilons(
    sequence,
    limit,
    epsilons,
    maxN,
  );

  // const candidateText =
  //   result.candidateN === null
  //     ? "Aucun rang candidat trouvé."
  //     : `Rang candidat : N = ${result.candidateN}`;

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

<div class="result-main-grid">
  <div class="chart-area">
    <p
      id="chart-context"
      class="chart-context"
    ></p>

    <div class="chart-wrapper">
      <canvas id="sequence-chart"></canvas>
    </div>
  </div>

  <div class="terms-area">
    <h3>Premiers termes</h3>

    ${renderFiniteTermsTable(result.capturedTerms)}
  </div>
</div>

${renderMultiEpsilonTable(multiResult.results)}

  <p class="numeric-warning">
    ⚠ Test numérique : ce résultat ne constitue pas une preuve mathématique.
  </p>
`;

  const canvas = getElement<HTMLCanvasElement>("sequence-chart");

  renderFiniteSequenceChart(
    canvas,
    sequence,
    limit,
    epsilon,
    maxN,
    result.candidateN,
  );

  const epsilonTable = document.getElementById("multi-epsilon-table");

  epsilonTable?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const row = target.closest<HTMLTableRowElement>("tr[data-epsilon]");

    if (!row) {
      return;
    }

    epsilonTable
      .querySelectorAll(".active-row")
      .forEach((element) => element.classList.remove("active-row"));

    row.classList.add("active-row");

    const selectedEpsilon = Number(row.dataset.epsilon);

    const candidateNValue = row.dataset.candidateN;

    const candidateN = candidateNValue === "" ? null : Number(candidateNValue);

    renderFiniteSequenceChart(
      canvas,
      sequence,
      limit,
      selectedEpsilon,
      maxN,
      candidateN,
    );

    const chartContext = getElement<HTMLElement>("chart-context");

    chartContext.textContent =
      candidateN === null
        ? `Graphique mis à jour pour ε = ${selectedEpsilon} — aucun rang candidat trouvé.`
        : `Graphique mis à jour pour ε = ${selectedEpsilon} — N = ${candidateN}.`;
  });
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

  const thresholds = parseNumberList(thresholdListInput.value);

  const multiResult = testInfiniteLimitForThresholds(
    sequence,
    direction,
    thresholds,
    maxN,
  );

  // const symbol = direction === "positive" ? "+∞" : "-∞";

  // const inequality =
  //   direction === "positive" ? `u(n) > ${threshold}` : `u(n) < ${threshold}`;

  // const candidateText =
  //   result.candidateN === null
  //     ? "Aucun rang candidat trouvé."
  //     : `Rang candidat : N = ${result.candidateN}`;

  const candidateText =
    result.candidateN === null ? "Aucun" : `N = ${result.candidateN}`;

  const limitSymbol = direction === "positive" ? "+∞" : "-∞";

  const condition =
    direction === "positive" ? `u(n) > ${threshold}` : `u(n) < ${threshold}`;

  resultSection.innerHTML = `
  <h2>Résultat</h2>

  <div class="result-summary">
    <div>
      <span>Suite</span>
      <strong>
        u(n) = ${expression}
      </strong>
    </div>

    <div>
      <span>Limite conjecturée</span>
      <strong>${limitSymbol}</strong>
    </div>

    <div>
      <span>Seuil A</span>
      <strong>${threshold}</strong>
    </div>

    <div>
      <span>Condition</span>
      <strong>${condition}</strong>
    </div>

    <div>
      <span>Rang candidat</span>
      <strong>${candidateText}</strong>
    </div>

    <div>
      <span>Test effectué jusqu'à</span>
      <strong>
        n = ${result.testedUntil}
      </strong>
    </div>
  </div>

<div class="result-main-grid">
  <div class="chart-area">
    <p
      id="chart-context"
      class="chart-context"
    ></p>

    <div class="chart-wrapper">
      <canvas id="sequence-chart"></canvas>
    </div>
  </div>

  <div class="terms-area">
    <h3>Termes significatifs</h3>

    ${renderInfiniteTermsTable(result.sampledTerms, direction, threshold)}
  </div>
</div>

${renderMultiThresholdTable(multiResult.results, direction)}

  <p class="numeric-warning">
    ⚠ Test numérique :
    ce résultat ne constitue pas
    une preuve mathématique.
  </p>
`;

  const canvas = getElement<HTMLCanvasElement>("sequence-chart");

  renderInfiniteSequenceChart(
    canvas,
    sequence,
    direction,
    threshold,
    maxN,
    result.candidateN,
  );

  const thresholdTable = document.getElementById("multi-threshold-table");

  thresholdTable?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const row = target.closest<HTMLTableRowElement>("tr[data-threshold]");

    if (!row) {
      return;
    }

    thresholdTable
      .querySelectorAll(".active-row")
      .forEach((element) => element.classList.remove("active-row"));

    row.classList.add("active-row");

    const selectedThreshold = Number(row.dataset.threshold);

    const candidateNValue = row.dataset.candidateN;

    const candidateN = candidateNValue === "" ? null : Number(candidateNValue);

    renderInfiniteSequenceChart(
      canvas,
      sequence,
      direction,
      selectedThreshold,
      maxN,
      candidateN,
    );

    const chartContext = getElement<HTMLElement>("chart-context");

    chartContext.textContent =
      candidateN === null
        ? `Graphique mis à jour pour A = ${selectedThreshold} — aucun rang candidat trouvé.`
        : `Graphique mis à jour pour A = ${selectedThreshold} — N = ${candidateN}.`;
  });
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
