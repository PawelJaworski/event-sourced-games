# Grader

Instructions for grading a single test-case run in the skill-creator eval loop.
Use these when grading inline, or paste them into a `general` Task subagent so
it grades one run independently.

## Your job

You are given the outputs of **one** run of **one** test case (either the
`with_skill` or the baseline run) and a list of **expectations** — short,
objective statements that should be true if the run succeeded. Judge each
expectation `true` or `false`, back it with concrete **evidence**, and write the
result to `grading.json` in that run's directory.

You are grading **what actually happened**, not what should have happened. Be
skeptical and literal. If you can't find evidence for an expectation, it fails.

## Inputs you'll be pointed at

- The run directory, e.g. `<workspace>/iteration-<N>/eval-<ID>/with_skill/`
  - `outputs/` — the deliverables the executor produced
  - `outputs/notes.md` — the executor's own summary, assumptions, and
    uncertainties (useful, but treat its claims as *claims* — verify them)
- The list of `expectations` for this eval (from `eval_metadata.json` or
  `evals/evals.json`).

## How to grade

1. **Prefer programmatic checks over eyeballing.** For anything mechanically
   verifiable — a file exists, a CSV parses and has column X, a value appears, a
   script was invoked, JSON is well-formed — write and run a small script (Python,
   `rg`, etc.) and cite its result as evidence. Scripts are faster, more reliable,
   and reusable across iterations and configs. Reserve human judgment for things
   a script genuinely can't check.

2. **Cite real evidence.** Quote the file and the specific content that proves
   (or disproves) the expectation: "Parsed `outputs/result.csv` with
   `csv.DictReader`; header row is `date,revenue,cost,profit_margin` — column
   present." Vague evidence ("looks fine") is not acceptable.

3. **Don't be fooled by plausible-looking but wrong output.** A file that
   *mentions* the right thing isn't the same as a file that *is* correct. If an
   expectation is "extracted John Smith's total", a document that merely contains
   the string "John Smith" doesn't pass unless the total is actually right. Note
   this kind of weakness — it often means the expectation itself should be
   tightened (see `eval_feedback` below).

4. **A missing deliverable fails every expectation that depends on it.** If the
   executor produced a text file where a spreadsheet was required, the
   spreadsheet expectations fail, with that as the evidence.

5. **Grade only this run.** Don't compare against the other configuration — the
   aggregation step does the with-skill-vs-baseline comparison later.

## Output: grading.json

Write to `<run-dir>/grading.json`. Use these **exact** field names — the
aggregation step and `summary.md` depend on them:

```json
{
  "expectations": [
    {
      "text": "Output is a valid .csv with a profit_margin column",
      "passed": true,
      "evidence": "Parsed outputs/result.csv with csv.DictReader; columns include 'profit_margin' (script exit 0)."
    },
    {
      "text": "The skill's build_chart.py was used",
      "passed": false,
      "evidence": "No reference to build_chart.py in notes.md or any output; a chart was drawn inline instead."
    }
  ],
  "summary": {
    "passed": 1,
    "failed": 1,
    "total": 2,
    "pass_rate": 0.5
  }
}
```

- `expectations[].text` — the expectation, copied verbatim.
- `expectations[].passed` — boolean.
- `expectations[].evidence` — concrete proof, ideally citing a script result or
  a quoted line from an output file.
- `summary.pass_rate` — `passed / total`, between 0 and 1.

## Optional: feedback on the expectations themselves

If, while grading, you notice an expectation is weak — easy to pass without
genuinely succeeding, ambiguous, or non-discriminating (would pass with or
without the skill) — add an `eval_feedback` block so the skill author can tighten
it next iteration. This is optional and only when you actually spot a problem.

```json
{
  "eval_feedback": {
    "suggestions": [
      {
        "expectation": "Output mentions the customer name",
        "reason": "A hallucinated invoice that name-drops the customer would also pass; check the line items match the input instead."
      }
    ],
    "overall": "Expectations check presence but not correctness."
  }
}
```
