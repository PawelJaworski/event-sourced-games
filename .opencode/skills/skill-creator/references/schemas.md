# JSON schemas

The JSON shapes used by the opencode skill-creator eval loop. Read this before
writing any of these files by hand.

This is the trimmed, opencode-native set. The original Anthropic skill-creator
also defined `benchmark.json`, `comparison.json`, `analysis.json`, and
`history.json` for its HTML viewer, blind-comparison, and optimization-loop
tooling — none of which ship in this edition. Results here are summarized as
markdown (`summary.md`), so those schemas are intentionally omitted.

---

## evals.json

The test set for a skill. Lives at `evals/evals.json` inside the skill folder.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's example task prompt",
      "expected_output": "Human-readable description of what success looks like",
      "files": ["evals/files/sample1.csv"],
      "expectations": [
        "The output is a valid .csv",
        "A profit_margin column is present",
        "The skill's build_chart.py was used"
      ]
    }
  ]
}
```

**Fields:**
- `skill_name` — matches the skill's `name` frontmatter.
- `evals[].id` — unique integer.
- `evals[].prompt` — the task to execute (write a realistic, concrete prompt).
- `evals[].expected_output` — human-readable description of success.
- `evals[].files` — optional input file paths, relative to the skill root.
- `evals[].expectations` — list of objective, verifiable statements. Add these
  *after* drafting prompts (often while the first runs are in flight).

---

## eval_metadata.json

Per-test-case metadata, written into each eval's run directory
(`<workspace>/iteration-<N>/eval-<ID>/eval_metadata.json`). Use a descriptive
`eval_name` — it becomes the section header in `summary.md`.

```json
{
  "eval_id": 1,
  "eval_name": "extract-invoice-totals",
  "prompt": "The user's task prompt",
  "expectations": [
    "Output is a valid .csv",
    "A profit_margin column is present"
  ]
}
```

If an iteration uses new or changed prompts, recreate these files for the new
eval directories — don't assume they carry over from a previous iteration.

---

## grading.json

Output of the grader (see `agents/grader.md`). One per run directory
(`<run-dir>/grading.json`, e.g. `.../eval-1/with_skill/grading.json`).

**Field names matter:** each expectation uses exactly `text`, `passed`,
`evidence`. The aggregation step that builds `summary.md` depends on these.

```json
{
  "expectations": [
    {
      "text": "Output is a valid .csv with a profit_margin column",
      "passed": true,
      "evidence": "Parsed outputs/result.csv with csv.DictReader; columns include 'profit_margin'."
    },
    {
      "text": "The skill's build_chart.py was used",
      "passed": false,
      "evidence": "No invocation of build_chart.py found in notes.md or the transcript; a chart was drawn inline instead."
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

- `expectations[]` — one graded entry per expectation, with evidence.
- `summary` — aggregate counts and `pass_rate` (passed / total, 0–1).

---

## timing.json

Optional per-run timing/usage, captured from a Task subagent's completion
notification (it's easiest to record at the moment the subagent finishes; it
may not be recoverable later). Lives at `<run-dir>/timing.json`. Skip it
entirely if your environment doesn't surface usage data.

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

---

## summary.md (shape, not JSON)

Not a schema, but the review deliverable. Generate it in the iteration
directory. Recommended shape:

```markdown
# <skill-name> — iteration <N> results

| Eval | Config | Pass rate | Passed/Total | Time (s) | Tokens |
|------|--------|-----------|--------------|----------|--------|
| extract-invoice-totals | with_skill | 1.00 | 2/2 | 23.3 | 84852 |
| extract-invoice-totals | without_skill | 0.50 | 1/2 | 19.1 | 60210 |
| ... | ... | ... | ... | ... | ... |
| **Overall** | **with_skill** | **0.92** | — | — | — |
| **Overall** | **without_skill** | **0.40** | — | — | — |
| **Delta** | | **+0.52** | | | |

## Outputs
- extract-invoice-totals (with skill): `iteration-1/eval-1/with_skill/outputs/`
- extract-invoice-totals (baseline):   `iteration-1/eval-1/without_skill/outputs/`

## Analyst observations
- "Output is a .csv" passes in both configs — non-discriminating; doesn't prove the skill's value.
- eval-3 swings 50% ± 40% across reruns — likely flaky; investigate before trusting it.
- With-skill adds ~4s but lifts pass rate by 0.52.

## Delta vs previous iteration (iteration 2+)
- Overall pass rate +0.12; the missing-axis-labels complaint from last round is resolved.
```

Put each `with_skill` row immediately before its baseline counterpart, and
always link to the saved output files so the user can open and judge them
directly — that qualitative read is the most valuable signal.
