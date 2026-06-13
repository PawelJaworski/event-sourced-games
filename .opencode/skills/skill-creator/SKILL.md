---
name: skill-creator
description: Create, edit, and improve opencode skills (the SKILL.md files under .opencode/skills/ or ~/.config/opencode/skills/). Use when the user wants to author a new skill from scratch, refactor or optimize an existing skill, write or tune a skill's description for better triggering, or set up a lightweight test/eval loop to check that a skill actually helps. Trigger on phrases like "make a skill", "create a SKILL.md", "improve this skill", "why isn't my skill triggering", or "test my skill".
---

# Skill Creator (opencode edition)

A skill for creating opencode skills and iteratively improving them.

This is an opencode-native adaptation of Anthropic's `skill-creator`. The core
craft of writing a good skill is the same everywhere; the mechanics (file
locations, frontmatter rules, how subagents and the eval loop work) are
specific to opencode and are spelled out below.

> If you are also touching `opencode.json`, agents, plugins, MCP servers, or
> permissions while wiring up a skill, load the built-in **customize-opencode**
> skill — it is the source of truth for opencode config shapes. This skill
> focuses on the SKILL.md itself.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few realistic test prompts and run an opencode subagent on them,
  once **with** the skill and once **without** it
- Evaluate the results with the user — qualitatively (read the outputs) and,
  where it makes sense, quantitatively (a small set of objective checks)
- Rewrite the skill based on what you learned
- Repeat until you and the user are satisfied
- Tune the description last, so the skill triggers when it should

Your job when using this skill is to figure out **where the user is** in this
process and jump in to help them move forward. Maybe they say "I want a skill
for X" and you take them all the way through. Maybe they already have a draft
and just want to test and iterate. Be flexible: if they say "skip the evals,
just vibe with me", do that instead.

## Communicating with the user

Skill authors span a wide range of technical familiarity. Read context cues
and match your language. Briefly define jargon ("eval", "assertion",
"frontmatter") when you are unsure the user knows it, rather than assuming.
Don't bury a non-technical user in JSON; don't over-explain to someone who is
clearly fluent.

---

## opencode specifics you must know

These are the things that differ from other skill systems. Get them right or
the skill silently won't load.

### Where skills live

| Scope            | Path                                          |
| ---------------- | --------------------------------------------- |
| Project (default)| `.opencode/skills/<name>/SKILL.md`            |
| Global (default) | `~/.config/opencode/skills/<name>/SKILL.md`   |
| Custom paths     | anything listed in `skills.paths` in `opencode.json` (scanned recursively for `**/SKILL.md`) |

- The file is named `SKILL.md` exactly, and lives in its own folder named
  after the skill.
- The folder name must match the `name` field in the frontmatter.
- opencode also auto-loads external skills from `~/.claude/skills/` and
  `~/.agents/skills/`, so an existing Claude-format skill often works as-is —
  but author new ones under `.opencode/skills/`.

### Frontmatter rules

```markdown
---
name: my-skill
description: One sentence covering WHAT this does AND WHEN to trigger it. Front-load literal keywords/filenames the user is likely to say.
---
```

- `name` — **required**. Lowercase, hyphen-separated, digits allowed, max 64
  chars, no leading/trailing/consecutive hyphens. Must equal the folder name.
- `description` — **effectively required**. Skills with no description are
  filtered out and never shown to the model, so they can never trigger. Max
  ~1024 chars, and **no angle brackets** (`<` / `>`).
- Optional: `license`, `compatibility` (string, e.g. "Requires python3 + pyyaml"),
  `metadata` (string→string map).
- **Do NOT use `allowed-tools`** here — that is a Claude Code field, not an
  opencode skill field. Tool gating in opencode is done via `permission` in
  `opencode.json` / agent frontmatter, not in the skill.

### Registering & loading

Skills in the default locations are picked up automatically. Skills elsewhere
need a `skills.paths` entry:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skills": { "paths": [".opencode/skills", "/abs/path/to/more/skills"] }
}
```

Config is **loaded once at startup and is not hot-reloaded.** After creating or
editing a skill (or any config-time file), tell the user to **quit and restart
opencode** before the new/updated skill is available. The running session keeps
using the already-loaded set.

### Subagents & tools available to this workflow

opencode exposes subagents through the **Task tool**:
- `explore` — fast, read-only codebase exploration (search, read, answer
  questions). Good for research while drafting.
- `general` — full multi-step agent that can read, write, and run commands.
  This is what you use to **run a test case** (execute a prompt and save
  outputs).

Launch multiple Task calls in a single message to run them in parallel. Each
fresh Task starts with a clean context; pass a `task_id` to resume one.

---

## Creating a skill

### Capture intent

Start by understanding the user's intent. The current conversation may already
contain a workflow worth capturing (e.g. "turn what we just did into a skill").
If so, mine the history first — the tools used, the order of steps, the
corrections the user made, the input/output formats observed — then have the
user fill gaps and confirm before moving on.

Pin down:

1. What should this skill enable the model to do?
2. When should it trigger? (which user phrases, files, contexts)
3. What's the expected output format?
4. Is this skill worth testing objectively? Skills with verifiable outputs
   (file transforms, data extraction, code generation, fixed workflow steps)
   benefit from a test loop. Subjective skills (writing tone, visual style)
   usually don't — lean on human review instead. Suggest a sensible default
   for the skill type, but let the user decide.

### Interview and research

Proactively ask about edge cases, input/output formats, example files, success
criteria, and dependencies. Don't write test prompts until this is ironed out.

Use the `explore` subagent (or inline tools) to research: look for similar
existing skills, read relevant code, check docs. Come prepared so you reduce
the burden on the user. If config questions come up, consult the
**customize-opencode** skill and `https://opencode.ai/config.json`.

### Write the SKILL.md

Fill in:

- **name** — the identifier (and folder name).
- **description** — the primary triggering mechanism. Cover both *what* the
  skill does AND *when* to use it; all "when to use" info lives here, not in the
  body. opencode (like other systems) tends to **under-trigger** skills, so make
  the description a little **pushy**. Instead of "How to build a fast internal
  dashboard.", write "How to build a fast internal dashboard. Use this whenever
  the user mentions dashboards, data viz, internal metrics, or wants to display
  company data — even if they don't say the word 'dashboard'." Front-load the
  concrete keywords/filenames the user will actually type. If the skill should
  stay quiet on adjacent topics, gate it: "Use ONLY when…".
- **compatibility** (optional) — required tools/deps, e.g. "Requires python3".
- **the body** — the instructions themselves.

### Skill writing guide

#### Anatomy of a skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled resources (optional)
    ├── scripts/    - executable code for deterministic/repetitive tasks
    ├── references/ - docs loaded into context only as needed
    └── assets/     - files used in output (templates, icons, fonts)
```

#### Progressive disclosure

Skills load in three levels. Respect them to keep context lean:

1. **Metadata** (name + description) — always in context (~100 words).
2. **SKILL.md body** — in context whenever the skill triggers (aim < 500 lines).
3. **Bundled resources** — pulled in only as needed (effectively unlimited;
   scripts can be executed without reading them into context at all).

Key patterns:
- Keep SKILL.md under ~500 lines. Approaching that, add a layer of hierarchy:
  move detail into `references/` and leave a clear pointer about when to read it.
- Reference bundled files explicitly, with guidance on *when* to open them.
- For large reference files (> ~300 lines), give them a table of contents.

**Organize by variant** when a skill spans multiple frameworks/domains, so the
model reads only the relevant file:

```
cloud-deploy/
├── SKILL.md          (workflow + how to choose)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

#### Principle of least surprise

Skills must not contain malware, exploit code, or anything that could
compromise security, and their behavior should match their stated intent. Don't
build deceptive skills or skills meant to enable unauthorized access or data
exfiltration. (Benign creative framings like "roleplay as a pirate reviewer"
are fine.)

#### Writing patterns

Prefer the imperative voice in instructions.

**Define output formats explicitly** when they matter:

```markdown
## Report structure
Always use this exact template:
# [Title]
## Summary
## Findings
## Recommendations
```

**Show examples** — they're worth a lot:

```markdown
## Commit message format
Example
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

#### Writing style

Explain the **why** behind instructions instead of piling on rigid `MUST` /
`ALWAYS` / `NEVER`. Modern models have good theory of mind: when they understand
*why* something matters, they generalize past the literal text. Heavy-handed
all-caps mandates are a yellow flag — reframe them as reasoning where you can.
Write a draft, then reread it with fresh eyes and tighten it. Keep it general,
not overfit to one example.

### Test cases

After drafting, write 2–3 realistic test prompts — the kind of thing a real
user would actually type, with concrete detail (file names, context, values).
Show them to the user: "Here are a few test cases I'd like to try — do these
look right, or do you want to add or change any?" Then run them.

Save them to `evals/evals.json` inside the skill folder. Don't write the
objective checks (`expectations`) yet — just the prompts. You'll draft the
checks while the runs are in flight. See `references/schemas.md` for the full
schema.

```json
{
  "skill_name": "example-skill",
  "evals": [
    { "id": 1, "prompt": "User's task prompt", "expected_output": "Description of success", "files": [] }
  ]
}
```

---

## Running and evaluating test cases (lightweight loop)

This is one continuous sequence — don't stop partway. The loop compares the
skill against a no-skill baseline using the **Task tool**, then summarizes the
results in markdown for the user to review. (opencode has no HTML eval viewer;
a clear markdown table plus the saved output files is the review surface.)

Put results in a sibling workspace: `<skill-name>-workspace/`. Within it,
organize by iteration (`iteration-1/`, `iteration-2/`, …) and, inside each, one
directory per test case (`eval-1/`, `eval-2/`, …), each containing
`with_skill/` and `without_skill/` (or `old_skill/` when improving). Create
directories lazily as you go, not all upfront.

### Step 1 — Launch all runs (with-skill AND baseline) in one turn

For each test case, launch **two** `general` subagents via the Task tool in the
**same message** so they finish around the same time. Don't run all the
with-skill cases first and circle back for baselines later.

**With-skill task prompt:**

```
Execute this task exactly as a user would, then save your outputs.
- First read this skill and follow it: <abs path>/.opencode/skills/<name>/SKILL.md
- Task: <eval prompt>
- Input files: <eval files, or "none">
- Save all deliverables to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Also write a short outputs/notes.md describing what you produced, any
  assumptions, and anything you were unsure about.
Report back: which files you created and a one-paragraph summary.
```

**Baseline task prompt** depends on context:
- **New skill** → no skill at all. Same task prompt, but **omit** the "read this
  skill" line. Save to `without_skill/outputs/`.
- **Improving an existing skill** → the *old* version. Before editing, snapshot
  it: `cp -r <skill-path> <workspace>/skill-snapshot/`, point the baseline
  subagent at the snapshot's SKILL.md, and save to `old_skill/outputs/`.

Give each eval a **descriptive name** (e.g. `extract-invoice-totals`), not just
`eval-1`, and use that name for the directory. Write an `eval_metadata.json` per
test case (expectations can be empty for now) — see `references/schemas.md`.

### Step 2 — While runs are in flight, draft the checks

Don't just wait. Draft objective `expectations` for each test case — short,
verifiable statements with clear names that read well in a results table (e.g.
"Output is a valid .csv with a `profit_margin` column", "The skill's
`build_chart.py` was invoked"). Explain them to the user. For subjective
skills, say so and lean on qualitative review instead of forcing checks.
Update `evals/evals.json` and the `eval_metadata.json` files once drafted.

### Step 3 — Capture timing/token data as runs complete

When a Task subagent finishes, opencode surfaces usage info in its completion
notification. If available, record it immediately into `timing.json` in that
run directory (`total_tokens`, `duration_ms`, derived seconds) — it's easiest
to capture at the moment of completion. If the data isn't exposed in your
environment, skip it; it's a nice-to-have, not the point.

### Step 4 — Grade, aggregate, and summarize

Once all runs are done:

1. **Grade each run.** Spawn a `general` grader subagent (or grade inline)
   following `agents/grader.md`: it reads the outputs and judges each
   expectation true/false **with evidence**, writing `grading.json` into the run
   directory. For checks that can be verified programmatically (file exists, CSV
   parses, value present), **write and run a small script** rather than eyeballing
   it — faster, more reliable, reusable across iterations. `grading.json` must
   use the field names `text`, `passed`, `evidence` (see `references/schemas.md`).

2. **Aggregate into a markdown summary.** Produce `summary.md` in the iteration
   directory: a table of pass-rate (and time/tokens if captured) for `with_skill`
   vs the baseline, per eval and overall, plus the delta. Put the with-skill row
   before its baseline. Below the table, link each saved output file/notes so the
   user can open them.

3. **Analyst pass.** Read the results and surface what the averages hide:
   checks that pass regardless of the skill (non-discriminating — they don't
   prove the skill's value), high-variance evals (possibly flaky), and
   time/token tradeoffs. List these as bullet observations under the table.

4. **Show the user.** Present `summary.md` inline (or point them to it) and tell
   them where the per-case output files are. Ask them to skim the outputs and
   tell you what's wrong or missing — that qualitative read is the most valuable
   signal.

---

## Improving the skill

This is the heart of the loop: you ran the tests, the user reacted, now make the
skill better.

1. **Generalize from feedback.** You're iterating on a handful of examples for
   speed, but the skill will run on countless prompts you'll never see. Fixing
   the specific example with a fiddly, overfit rule is a trap. If an issue is
   stubborn, try a different framing or metaphor, or recommend a different
   working pattern — it's cheap to try and often lands better than another `MUST`.

2. **Keep it lean.** Remove instructions that aren't earning their place. Read
   the **transcripts**, not just the final outputs — if the skill is making the
   model waste effort, cut the part causing it and see what happens.

3. **Explain the why.** Today's models are smart and have good theory of mind.
   Even when user feedback is terse or frustrated, work out what they actually
   need and encode that understanding. All-caps mandates and rigid structures are
   a yellow flag — reframe as reasoning where possible. It's more humane and more
   effective.

4. **Bundle repeated work.** If every test run independently wrote a similar
   helper (a `create_docx.py`, a `build_chart.py`) or repeated the same
   multi-step dance, that's a strong signal to write it once, drop it in
   `scripts/`, and have the skill call it. Every future invocation then skips
   reinventing it.

Take your time here — thinking is not the bottleneck. Draft a revision, reread
it fresh, improve it.

### The iteration loop

1. Apply your improvements.
2. Rerun all test cases into a new `iteration-<N+1>/`, baselines included. New
   skill → baseline stays `without_skill`. Improving → use judgment: the version
   the user arrived with, or the previous iteration.
3. Regenerate `summary.md`, and include a short **delta vs previous iteration**
   note so progress is visible.
4. Have the user review; read their feedback; improve again.

Keep going until the user is happy, the outputs all look good, or you've stopped
making meaningful progress.

---

## Tuning the description (do this last)

The `description` is the single biggest lever on whether opencode actually
invokes the skill. Once the body is solid, tighten it.

### How triggering works

Skills appear to opencode as a name + description in its available-skills list,
and the model decides whether to consult one based on that text. Crucially, it
only reaches for a skill on tasks it can't trivially handle itself: a one-step
"read this file" may not trigger a skill even with a perfect description, because
the model just does it. Complex, multi-step, or specialized tasks reliably
trigger when the description matches. So design test queries that are
**substantive** enough that consulting a skill is actually worth it.

### A practical, opencode-native tuning pass

opencode has no `claude -p` optimization loop, so do this by hand — it's quick
and transparent:

1. **Write ~12–20 trigger queries**, a mix of should-trigger and
   should-not-trigger, and save as JSON:

   ```json
   [
     { "query": "realistic user prompt", "should_trigger": true },
     { "query": "near-miss that should NOT trigger", "should_trigger": false }
   ]
   ```

   Make them realistic and concrete — file paths, job context, column names,
   company names, casual phrasing, the odd typo. For positives (≈half), vary the
   phrasing and include cases where the user never names the skill or file type
   but clearly needs it. For negatives (≈half), the valuable ones are
   **near-misses** that share keywords but actually need something else. Avoid
   obviously-irrelevant negatives ("write a fibonacci function" for a PDF
   skill) — they test nothing. Get the user to sign off on the set; bad queries
   make bad descriptions.

2. **Evaluate the current description.** For each query, judge — ideally with a
   fresh `general` subagent given only the name + description and the query, to
   avoid your own bias — whether the skill *should* be consulted, and compare to
   the label. Tally a simple should-trigger / should-not-trigger accuracy.

3. **Propose a better description.** Look at the misses: under-triggers usually
   mean the description is missing the user's vocabulary or isn't pushy enough;
   over-triggers (firing on near-misses) mean it's too broad and needs an
   "Use ONLY when… / not for…" boundary. Rewrite, re-evaluate on the same set,
   and keep the version that does best. Show the user before/after plus the
   scores, and update the frontmatter.

---

## Validating the skill

Before you call it done, run the bundled validator to catch frontmatter
mistakes (bad name casing, missing/over-long description, angle brackets,
stray fields like `allowed-tools`):

```bash
python3 .opencode/skills/skill-creator/scripts/quick_validate.py .opencode/skills/<name>
```

It exits non-zero with a message on any problem. Fix and rerun until it passes.
This catches the silent-load-failure class of bugs before the user restarts.

---

## A note on this being opencode, not Claude Code

If you've seen the original Anthropic `skill-creator`, here's what intentionally
differs, so you don't go looking for machinery that isn't here:

- **No HTML eval viewer / `generate_review.py`.** Review happens via `summary.md`
  plus the saved output files. A clean markdown table is the deliverable — don't
  hand-roll a bespoke HTML viewer.
- **No `.skill` packaging / `present_files`.** opencode skills are just folders
  in place. "Shipping" a skill means it sits at `.opencode/skills/<name>/` (or a
  global/custom path) and loads on restart. There's nothing to package.
- **No `claude -p` description-optimization loop.** Tune the description by hand
  using the pass above.
- **Frontmatter differs.** Use `name`, `description`, and optionally `license` /
  `compatibility` / `metadata`. No `allowed-tools`.
- **Restart to load.** Config isn't hot-reloaded — remind the user to restart
  opencode after creating or changing a skill.

---

## Reference files

- `references/schemas.md` — JSON shapes for `evals.json`, `eval_metadata.json`,
  `grading.json`, and the summary data. Read it before writing any of those by
  hand.
- `agents/grader.md` — how a grader subagent should evaluate expectations
  against outputs and write `grading.json`.
- `scripts/quick_validate.py` — frontmatter validator for opencode skills.

---

Core loop, once more, for emphasis:

- Figure out what the skill is for
- Draft or edit the skill
- Run an opencode subagent on test prompts, with-skill and baseline
- Evaluate outputs with the user (markdown `summary.md` + the saved files)
- Improve, and repeat until you're both satisfied
- Tune the description, validate, and remind the user to restart opencode

Add these as todos so you don't drop a step. Good luck!
