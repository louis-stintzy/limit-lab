import { compile } from "mathjs";
import type { Sequence } from "../sequences/testFiniteLimit";

export function createSequenceFromExpression(expression: string): Sequence {
  if (expression.trim() === "") {
    throw new Error("L'expression de la suite ne peut pas être vide.");
  }

  const compiledExpression = compile(expression);

  return (n: number): number => {
    const value = compiledExpression.evaluate({ n });

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(
        `L'expression ne donne pas une valeur numérique finie pour n = ${n}.`,
      );
    }

    return value;
  };
}
