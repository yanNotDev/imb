// Server-only correct answers and scoring utility.
// DO NOT import this file from any client component (pages or portal components) to avoid leaking answers.

// Index i corresponds to question id (i+1) as a string.
export const CORRECT_ANSWERS: number[] = [
  15552, 2, 108, 16
];

export function scoreAnswers(answers: Record<string, unknown>): number {
  let total = 0;
  CORRECT_ANSWERS.forEach((correct, index) => {
    const qid = String(index + 1);
    const given = answers[qid];
    if (typeof given === "number") {
      if (given === correct) total++;
      return;
    }
    if (typeof given === "string" && given.trim() !== "") {
      const asNum = Number(given);
      if (!Number.isNaN(asNum) && asNum === correct) total++;
    }
  });
  return total;
}
