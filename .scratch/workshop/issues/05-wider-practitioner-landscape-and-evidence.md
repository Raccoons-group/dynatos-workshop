# Wider practitioner landscape and evidence

Type: research (AFK)
Status: resolved
Blocked by: none

## Question

Beyond Pocock and Tan, which practitioners and organisations shape current best practice for agentic software development? Candidates include Kent Beck on augmented coding, Simon Willison, Thoughtworks and Birgitta Böckeler on spec-driven development, GitHub Spec Kit, Addy Osmani and Geoffrey Huntley. And what does hard evidence say, for example DORA's 2025 report on AI-assisted software development, METR's developer productivity study, and others?

Output: where they agree, where they disagree, and 5–10 claims strong enough to put on a slide, each with its primary source.

## Answer

Full note with ten claims for slides and dated sources: [research/practitioner-landscape-and-evidence.md](../research/practitioner-landscape-and-evidence.md). The note adds Dex Horthy, Charity Majors, Kief Morris, OpenAI's harness-engineering write-up, and the Claude Code team's review post (15 Oct 2026). It drops Karpathy and Yegge's Gas Town.

- **Where they agree:**
  - Verification is the job, not typing.
  - When an agent repeats a mistake, fix the harness, not the output.
  - Work goes spec → plan → small steps.
  - Hard rules belong in deterministic checks.
  - Agent guidance is a shared team asset in the repo (Thoughtworks Radar Vol 34, Apr 2026: "curated shared instructions" at Adopt).
- **Where they disagree:**
  - TDD inside the agent loop: Böckeler, 10 Aug 2026, found no quality gain at 3–8.5x the tokens, while Beck, Willison and Pocock still prescribe it.
  - Whether a human reads every line, with risk-tiered review emerging.
  - Heavy vs light spec tooling.
  - Swarms (the Radar says Caution; Beck is sceptical).
- **The evidence says AI is an amplifier and the bottleneck moves to review.**
  - DORA 2025: throughput up, stability down.
  - CMU's Cursor study: the speed-up faded while complexity stayed.
  - METR, Mar 2026: about half of agent PRs that pass the tests wouldn't be merged.
  - DORA 2026 pieces describe a "verification tax" and a J-curve.
- **The speed-up is real but unmeasured.** METR 2025 found developers 19% slower while believing they were 20% faster; the follow-up was compromised. Stack Overflow 2026: 48% trust AI output they can verify, and Claude Code (66%) is used more than Copilot (59%).
- **Team discipline shows up in the data, but more context isn't better.**
  - Repos with committed AI config saw about half the complexity growth.
  - An ETH study found AGENTS.md-style files didn't generally help and cost over 20% more.
  - Anthropic's skill-formation RCT: juniors scored 17% lower on mastery, except those who kept asking "why".
- **Design consequences:**
  - Present TDD as one option, with humans writing acceptance examples and characterization tests first on brownfield code.
  - Give review its own block.
  - Keep the AGENTS.md template short, with an owner.
  - Measure team signals (first-pass acceptance, review rounds, rework), not volume or feelings.
  - Frame uneven adoption as a feedback-loop problem.
  - Give the POs ownership of acceptance examples.
- **Caveats:** there's no 2026 DORA State of AI report (one unconfirmed source says the survey was skipped). Radar Vol 34 is current. Some sources are vendors or Anthropic staff, and each is flagged in the note.
