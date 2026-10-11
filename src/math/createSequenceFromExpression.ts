import { evaluate } from "mathjs";
import type { Sequence } from "../sequences/testFiniteLimit";

export function createSequenceFromExpression(expression: string): Sequence {
  if (expression.trim() === "") {
    throw new Error("L'expression de la suite ne peut pas être vide.");
  }

  return (n: number): number => {
    const value = evaluate(expression, { n });

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(
        `L'expression ne donne pas une valeur numérique finie pour n = ${n}.`,
      );
    }

    return value;
  };
}
