import { Chart, registerables, type ChartDataset } from "chart.js";

import type { Sequence } from "../sequences/testFiniteLimit";
import type { InfiniteLimitDirection } from "../sequences/testInfiniteLimit";

Chart.register(...registerables);

let currentChart: Chart<"line"> | null = null;

type ChartWindow = {
  minN: number;
  maxN: number;
};

function destroyCurrentChart(): void {
  if (currentChart !== null) {
    currentChart.destroy();
    currentChart = null;
  }
}

function buildFocusedWindow(
  maxN: number,
  candidateN: number | null,
  before = 5,
  after = 8,
): ChartWindow {
  if (candidateN !== null) {
    return {
      minN: Math.max(1, candidateN - before),
      maxN: Math.min(maxN, candidateN + after),
    };
  }

  // Si aucun rang candidat n'est trouvé,
  // on regarde les derniers termes testés.

  return {
    minN: Math.max(1, maxN - 12),
    maxN,
  };
}

function buildIndexesFromWindow(window: ChartWindow): number[] {
  const indexes: number[] = [];

  for (let n = window.minN; n <= window.maxN; n++) {
    indexes.push(n);
  }

  return indexes;
}

export function renderFiniteSequenceChart(
  canvas: HTMLCanvasElement,
  sequence: Sequence,
  limit: number,
  epsilon: number,
  maxN: number,
  candidateN: number | null,
): void {
  destroyCurrentChart();

  const window = buildFocusedWindow(maxN, candidateN, 5, 8);

  const indexes = buildIndexesFromWindow(window);

  const terms = indexes.map((n) => ({
    x: n,
    y: sequence(n),
  }));

  const lowerBound = limit - epsilon;
  const upperBound = limit + epsilon;

  const datasets: ChartDataset<"line", { x: number; y: number }[]>[] = [
    {
      label: "u(n)",
      data: terms,
      showLine: false,
      pointRadius: 4,
    },
    {
      label: "L",
      data: [
        { x: window.minN, y: limit },
        { x: window.maxN, y: limit },
      ],
      pointRadius: 0,
      borderWidth: 2,
    },
    {
      label: "L - ε",
      data: [
        { x: window.minN, y: lowerBound },
        { x: window.maxN, y: lowerBound },
      ],
      pointRadius: 0,
      borderDash: [6, 4],
      // borderWidth: 1.5,
      // borderColor: "#7c3aed",
    },
    {
      label: "L + ε",
      data: [
        { x: window.minN, y: upperBound },
        { x: window.maxN, y: upperBound },
      ],
      pointRadius: 0,
      borderDash: [6, 4],
      // borderWidth: 1.5,
      // borderColor: "#7c3aed",
    },
  ];

  currentChart = new Chart<"line", { x: number; y: number }[]>(canvas, {
    type: "line",
    data: {
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "nearest",
        intersect: false,
      },

      plugins: {
        title: {
          display: true,
          text:
            candidateN === null
              ? "Zoom sur les derniers termes testés"
              : `Zoom autour du rang candidat N = ${candidateN}`,
        },
      },

      scales: {
        x: {
          type: "linear",
          min: window.minN - 0.5,
          max: window.maxN + 0.5,
          ticks: {
            precision: 0,
          },
          title: {
            display: true,
            text: "Rang n",
          },
        },

        y: {
          title: {
            display: true,
            text: "u(n)",
          },
        },
      },
    },
  });
}

export function renderInfiniteSequenceChart(
  canvas: HTMLCanvasElement,
  sequence: Sequence,
  direction: InfiniteLimitDirection,
  threshold: number,
  maxN: number,
  candidateN: number | null,
): void {
  destroyCurrentChart();

  const window = buildFocusedWindow(maxN, candidateN, 5);

  const indexes = buildIndexesFromWindow(window);

  const terms = indexes.map((n) => ({
    x: n,
    y: sequence(n),
  }));

  const symbol = direction === "positive" ? ">" : "<";

  currentChart = new Chart(canvas, {
    type: "line",

    data: {
      datasets: [
        {
          label: "u(n)",
          data: terms,
          showLine: false,
          pointRadius: 4,
        },
        {
          label: `Seuil A (${symbol} ${threshold})`,
          data: [
            { x: window.minN, y: threshold },
            { x: window.maxN, y: threshold },
          ],
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [6, 4],
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "nearest",
        intersect: false,
      },

      plugins: {
        title: {
          display: true,
          text:
            candidateN === null
              ? "Zoom sur les derniers termes testés"
              : `Zoom autour du rang candidat N = ${candidateN}`,
        },
      },

      scales: {
        x: {
          type: "linear",
          min: window.minN - 0.5,
          max: window.maxN + 0.5,
          ticks: {
            precision: 0,
          },
          title: {
            display: true,
            text: "Rang n",
          },
        },

        y: {
          title: {
            display: true,
            text: "u(n)",
          },
        },
      },
    },
  });
}
