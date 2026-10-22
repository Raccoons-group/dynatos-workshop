# Wider practitioner landscape and evidence for agentic software development

Research for [issue 05](../issues/05-wider-practitioner-landscape-and-evidence.md). Researched on 2026-10-20 against primary sources: people's own blogs, repos and essays, the reports themselves, arXiv papers, and the Thoughtworks Radar blip pages. Every claim cites its URL. Matt Pocock and Lauren Tan are out of scope here (see issue 04), and Anthropic's playbook is covered in [anthropic-playbook-and-skills.md](anthropic-playbook-and-skills.md).

**About the wording.** Everything is in my own words, apart from a few short phrases in quotation marks. Check the source before you put a quote on a slide. Where only a secondary source was reachable, I say so.

**About rigour.** Each piece of evidence is labelled: **RCT** (randomised trial), **quasi-exp.** (difference-in-differences or synthetic control), **obs.** (observational), **survey**, **vendor** (published by a company that sells into this market), or **anecdote/essay**.

---

## TL;DR

- **The practitioners agree on more than the hype suggests.** Verification is the job, not typing. When the agent repeats a mistake, you fix the harness (instructions, lint rules, tests, hooks), not just the output. Work flows from spec to plan to small steps. Hard rules belong in deterministic checks, not prose. Guidance is a team asset that lives in the repo. ([Willison](https://simonwillison.net/guides/agentic-engineering-patterns/what-is-agentic-engineering/), [Hashimoto](https://mitchellh.com/writing/my-ai-adoption-journey), [Böckeler](https://martinfowler.com/articles/harness-engineering.html), [Radar](https://www.thoughtworks.com/radar/techniques/curated-shared-instructions-for-software-teams))
- **They disagree on four things:** whether TDD inside the agent loop is worth it, whether humans should still read every line, how heavy spec tooling should be, and whether parallel agents or swarms are the future. The newest data point is a small August 2026 experiment by Böckeler. Prescribing TDD to the agent gave no clear quality gain and cost 3 to 8.5 times the tokens, and she has stopped asking agents to write tests first. ([martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html))
- **The hard evidence says AI is an amplifier, and that the bottleneck moves downstream.** DORA 2025 found that AI adoption raises throughput but still hurts delivery stability ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)). A CMU study of Cursor adoption found a velocity spike that faded, while code complexity and static-analysis warnings stayed up ([arXiv 2511.04427](https://arxiv.org/abs/2511.04427)). Review becomes the constraint ([DORA, Mar 2026](https://dora.dev/insights/balancing-ai-tensions/)).
- **Productivity numbers are shaky, and perception is unreliable.** METR's 2025 RCT found developers 19% slower while they believed they were 20% faster ([METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)). By February 2026 METR could no longer run the study cleanly: developers refused to work without AI, and 30–50% held back tasks. METR now believes developers are sped up, but cannot say by how much ([METR](https://metr.org/blog/2026-02-24-uplift-update/)).
- **Team-level discipline shows up in the data.** Repositories with committed AI configuration showed about half the growth in cognitive complexity after agent adoption (+27% vs +53%). That result is observational ([arXiv 2608.25241](https://arxiv.org/abs/2608.25241)). But more context is not better: context files did not generally improve agent success and raised cost by over 20% ([arXiv 2602.11988](https://arxiv.org/abs/2602.11988)). Keep shared instructions short, curated, committed and audited.

---

## 1. Practitioners and organisations

### Individuals

**Kent Beck: augmented coding (TDD with a "genie").** Beck separates *vibe coding*, where you only care about behaviour, from *augmented coding*, where you still care about the code, its complexity, the tests and their coverage, but no longer type most of it ([Augmented Coding: Beyond the Vibes, 25 Jun 2025](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes)). His system prompt has the agent take the next unmarked test from `plan.md`, make it pass with minimal code, and keep structural and behavioural changes in separate commits. He watches for three warning signs: loops, functionality he didn't ask for, and the genie "cheating" by disabling or deleting tests (same source). In 2026 he experimented with packaging TCR (test && commit || revert) as an agent Skill ([1 Apr 2026](https://newsletter.kentbeck.com/p/genie-sessions-tcr-skill)). He is openly sceptical of multi-agent swarms. Coordinating several agents strained him, and he calls *several humans steering together* ("multiplayer") the unsolved problem ([Nobody Wants Agents, 23 Apr 2026](https://newsletter.kentbeck.com/p/genie-lessons-nobody-wants-agents)).

**Simon Willison: agentic engineering, verification and etiquette.** Willison is the most-read documenter of the field. Since February 2026 he has kept a living guide, *Agentic Engineering Patterns* ([guide](https://simonwillison.net/guides/agentic-engineering-patterns), [launch post, 23 Feb 2026](https://simonwillison.net/2026/feb/23/agentic-engineering-patterns)). He defines agentic engineering as professionals using agents that write *and execute* code to amplify their existing expertise. He reserves "vibe coding" for unreviewed, prototype-quality output ([What is agentic engineering?](https://simonwillison.net/guides/agentic-engineering-patterns/what-is-agentic-engineering/)). His core positions:
- Code is now cheap, but *good* code is not. Good code is proven to work, tested, simple and documented ([Writing code is cheap now](https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/)).
- Your job is to deliver code you have *proven* to work, both by manual testing and with an automated test that fails if you revert the change ([18 Dec 2025](https://simonwillison.net/2025/Dec/18/code-proven-to-work/)).
- Red/green TDD and "first run the tests" are cheap prompts with a lot of engineering discipline built in ([Red/green TDD](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/), [First run the tests](https://simonwillison.net/guides/agentic-engineering-patterns/first-run-the-tests/)).
- The cardinal anti-pattern is opening a PR whose code or description you haven't reviewed yourself ([Anti-patterns](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/)).
- His October 2025 list of what makes agents productive is a list of classic team practices: a stable test suite, planning, documentation, version control habits, CI and linting, a review culture, manual QA, and preview environments. AI "amplifies existing expertise" ([Vibe engineering, 7 Oct 2025](https://simonwillison.net/2025/Oct/7/vibe-engineering/)).
- He later argued that the key skill is confident instruction plus confident verification. Reading every line is one option for verifying, and he says it has never been the most effective one ([More than just code review, 22 Aug 2026](https://simonwillison.net/2026/Aug/22/more-than-just-code-review/)).

**Birgitta Böckeler and Thoughtworks colleagues on martinfowler.com: the sceptical experimenters.** Böckeler (Thoughtworks Distinguished Engineer) writes the *Exploring Gen AI* series ([index](https://martinfowler.com/articles/exploring-gen-ai.html)).
- **Spec-driven development (15 Oct 2025).** She gave SDD its taxonomy: spec-first, spec-anchored and spec-as-source. Testing Kiro, spec-kit and Tessl, she found that one workflow is forced onto every problem size. Kiro turned a small bug into 4 user stories with 16 acceptance criteria. She also found heavy markdown review overhead, agents ignoring or over-applying specs, and a false sense of control. She warns that spec-as-source could combine the rigidity of Model-Driven Development with the unpredictability of LLMs ([Understanding SDD](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)).
- **Harness engineering (2 Apr 2026).** Her harness article gives the field its control model. *Guides* (feedforward: AGENTS.md, skills, specs) steer the agent before it acts. *Sensors* (feedback: tests, linters, structural tests, AI review) let it self-correct. Either kind can be *computational* or *inferential*. Behaviour is the hardest thing to harness, and correctness is beyond any sensor if the human never specified what they wanted ([Harness engineering](https://martinfowler.com/articles/harness-engineering.html)).
- **TDD in the agent loop (10 Aug 2026).** Her newest experiment is small and greenfield (Sonnet 4.6 implementing, Opus judging). Prescribing TDD gave no discernible quality gain and no mutation-score gain, at 3 to 8.5 times the tokens. She has stopped telling agents to write tests first, and she now monitors outcomes with mutation testing and static analysis instead ([TDD inside the agent loop](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html)).
- **Kief Morris (4 Mar 2026)** added the *in / out / on the loop* framing. Humans "on the loop" fix the harness that produced a bad artefact, not the artefact itself ([Humans and Agents in Software Engineering Loops](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html)).
- **Naresh Jain (13 Oct 2026)** found that a behavioural harness (OpenAPI specs, examples, contract tests) took a cheap model from 3/10 to 10/10 accepted builds. On a frontier model it only added cost, since that model passed 10/10 either way. His conclusion is that a harness is not automatically worth it. Clear specs and examples are ([Are Harnesses Worth the Cost?](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html)).

**Addy Osmani: brownfield, intent and keeping humans sharp.** Osmani was at Google for over 14 years. He is now a Member of Technical Staff at Anthropic working on Claude Code, which is worth knowing when weighing his views ([Brownfield Agentic Engineering, 14 Sep 2026](https://addyosmani.com/blog/brownfield-agentic-engineering/)). He published heavily in 2026 ([blog](https://addyosmani.com/blog/)). His brownfield playbook is the most directly applicable piece for the workshop case:
- Zone the codebase green, yellow or red. Agent autonomy follows blast radius, observability and recoverability, not model confidence.
- Start with characterization tests, and don't let the same session be the only author of the tests it then makes pass.
- Turn repeated review corrections into lint rules, hooks, tests or skills.

Related pieces:
- *Intent debt*: agents can regenerate code but cannot supply the "why", so specs, ADRs and AGENTS.md should record goals, constraints and the definition of done ([5 Jun 2026](https://addyosmani.com/blog/intent-debt/)).
- *Agentic skill decay*: the reps that built judgement must now be deliberate ([31 Aug 2026](https://addyosmani.com/blog/agentic-skill-decay/)).
- *Audit your agent files*: configuration decays, so audit it on a cadence, keep only what the model can't infer, and move hard rules into tests, hooks or permissions ([27 Aug 2026](https://addyosmani.com/blog/audit-your-agent-files/)).

**Geoffrey Huntley: loops and backpressure.** Huntley's "Ralph" is a bash `while` loop that feeds the same prompt to an agent with a fresh context each time. Each pass does one item from a plan file, against specs the agent wrote earlier, with tests, type checkers and static analysis as *backpressure* ([Ralph, 14 Jul 2025](https://ghuntley.com/ralph/)). He scopes it to bootstrapping greenfield projects and says he would not use it on an existing codebase (same source). In October 2026 he argued against relying on prose in AGENTS.md and in favour of deterministic enforcement. His example is a pre-commit hook that fails the commit and injects a corrective prompt, which brought agent compliance to about 10 out of 10. He also says humans fit in at two points, "vision and verification", and that there is no longer a place for engineers who type code by hand ([Agency, 13 Oct 2026](https://ghuntley.com/agency/)). Thoughtworks lists the Ralph loop at Assess ([Radar](https://www.thoughtworks.com/radar)).

**Harper Reed: the original spec → plan → todo workflow.** His February 2025 post is the template many later workflows copy (including the to-spec / to-tickets pattern in issue 04). It runs in three steps ([My LLM codegen workflow atm, 16 Feb 2025](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)):
1. Hone the idea with an LLM that asks one question at a time, ending in `spec.md`.
2. Have a reasoning model turn it into small, test-first steps (`prompt_plan.md` plus `todo.md`).
3. Execute step by step.

He also named the team problem early: the workflow is "largely a solo endeavor", with colliding bots and horrific merges (same source).

**Armin Ronacher: agent-friendly codebases and shared understanding.** In June 2025 he gave concrete codebase advice ([Agentic Coding Recommendations, 12 Jun 2025](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)):
- Keep code simple and explicit, and prefer plain SQL to ORM tricks.
- Make tools fast and quiet.
- Log to files the agent can read.
- Refactor when complexity outgrows the agent, neither too early nor too late.
- Isolate shared state so agents can run in parallel.

His July 2026 essay is the clearest statement of the *team* risk. Friction used to force engineers to talk, and that kept the team's shared understanding synchronized. Agents remove the friction without removing the need, so the project keeps growing while understanding fragments ([The Tower Keeps Rising, 13 Jul 2026](https://lucumr.pocoo.org/2026/7/13/the-tower-keeps-rising/)).

**Mitchell Hashimoto: a sober adoption ladder and "engineer the harness".** His February 2026 post is a six-step adoption path that suits an uneven team ([My AI Adoption Journey, 5 Feb 2026](https://mitchellh.com/writing/my-ai-adoption-journey)):
1. Drop the chatbot and use an agent.
2. Reproduce your own manual commits with the agent, to learn where it works.
3. Start agents in the last 30 minutes of the day.
4. Outsource the slam dunks.
5. Engineer the harness: every time an agent makes a mistake, change AGENTS.md or add a tool so it can't happen again.
6. Always have an agent running. He manages this only 10–20% of the time.

He runs a single agent, says verification tools let agents fix their own mistakes, and is worried about skill formation in juniors (same source). Ghostty's contributor policy is a team-level counterpart. All AI use must be disclosed, the human must fully understand the code, and low-quality AI submissions get the contributor publicly denounced. The policy's stated position is that the people are the problem, not the tools ([AI_POLICY.md](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md)).

**Dex Horthy (HumanLayer): research → plan → implement. Added because his framing is widely copied for brownfield work.** His claim is that the context window is the only lever you have. He keeps it 40–60% full and compacts deliberately between three phases: research, plan and implement. Human review goes upstream because errors compound: a bad line of research can produce thousands of bad lines of code, so review the research and the plan. He reports fixes and features landing in a 300k-line Rust codebase he didn't know, and he also reports failures ([ace-fca.md, Aug 2025, undated](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)).

**Charity Majors: the enthusiast–sceptic gap. Added because it maps directly onto uneven adoption.** Both camps are right. Teams that sit out lose ground. Shipping code faster than people can read it draws down a trust account that took years to build. Nothing naturally connects the two camps, so leaders need to build that feedback loop deliberately ([Charity Majors, Jun 2026](https://charitydotwtf.substack.com/p/ai-enthusiasts-are-in-a-race-against), via [Willison](https://simonwillison.net/2026/Jun/4/ai-enthusiasts-ai-skeptics/)).

### Organisations

**Thoughtworks Technology Radar (Vol. 34, 15 Apr 2026, still the current edition on 2026-10-20).** The Radar's four themes include "Putting coding agents on a leash" and "Retaining principles, relinquishing patterns" ([Radar](https://www.thoughtworks.com/radar)). The blips most relevant to this workshop:
- **Adopt: curated shared instructions for software teams.** Commit AGENTS.md or CLAUDE.md to the repo and the service template. The Radar calls individuals writing prompts from scratch an anti-pattern ([blip](https://www.thoughtworks.com/radar/techniques/curated-shared-instructions-for-software-teams)). Context engineering is also at Adopt ([Radar](https://www.thoughtworks.com/radar)).
- **Trial: feedback sensors for coding agents.** Wire compilers, linters, structural tests and test suites into the agent loop, and run them before commit ([blip](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)). Agent Skills are also at Trial.
- **Assess:**
  - Spec-driven development, first placed in Nov 2025 ([blip](https://www.thoughtworks.com/radar/techniques/spec-driven-development)).
  - GitHub Spec Kit ([blip](https://www.thoughtworks.com/radar/languages-and-frameworks/github-spec-kit)).
  - OpenSpec ([blip](https://www.thoughtworks.com/radar/tools/openspec)).
  - Superpowers ([blip](https://www.thoughtworks.com/radar/languages-and-frameworks/superpowers)).
  - Skills as executable onboarding documentation ([blip](https://www.thoughtworks.com/radar/techniques/skills-as-executable-onboarding-documentation)).
  - Measuring collaboration quality with coding agents ([blip](https://www.thoughtworks.com/radar/techniques/measuring-collaboration-quality-with-coding-agents)).
- **Caution:**
  - Agent instruction bloat ([blip](https://www.thoughtworks.com/radar/techniques/agent-instruction-bloat)).
  - Codebase cognitive debt ([blip](https://www.thoughtworks.com/radar/techniques/codebase-cognitive-debt)).
  - Coding agent swarms ([blip](https://www.thoughtworks.com/radar/techniques/coding-agent-swarms)).
  - Coding throughput as a measure of productivity ([blip](https://www.thoughtworks.com/radar/techniques/coding-throughput-as-a-measure-of-productivity)).
  - Complacency with AI-generated code stayed on Hold from Oct 2024 through Nov 2025 ([blip](https://www.thoughtworks.com/radar/techniques/complacency-with-ai-generated-code)).

**GitHub Spec Kit (and OpenSpec as the lightweight alternative).** Spec Kit was launched in September 2025 to make specs "living" artefacts in a gated Specify → Plan → Tasks → Implement flow across agents ([GitHub blog, 2 Sep 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)). By September 2026 it had about 142k stars ([repo](https://github.com/github/spec-kit)) and 38 agent integrations. It now ends with a *Converge* phase and describes its entry points as "independent entry points, not mandatory phases" ([site, updated 28 Sep 2026](https://github.github.com/spec-kit/)). Its tagline has also widened to "SDD or any other process" ([repo](https://github.com/github/spec-kit)). In other words, it has backed off a mandatory heavy process. Thoughtworks teams use it mostly on brownfield systems. They found that the constitution and the spec → plan → tasks flow surfaced hidden assumptions earlier, but its markdown output was too verbose, and instruction growth led to context rot ([Radar blip](https://www.thoughtworks.com/radar/languages-and-frameworks/github-spec-kit)). OpenSpec works with spec *deltas* rather than complete specs, which the Radar calls better suited to existing systems. The Radar also advises checking periodically whether native agent features make SDD tooling unnecessary ([OpenSpec blip](https://www.thoughtworks.com/radar/tools/openspec)).

**OpenAI: harness engineering at the extreme.** OpenAI's February 2026 write-up describes a five-month internal experiment: roughly a million lines of a beta product with no manually written source code. Docs serve as the agents' system of record, and architecture is enforced mechanically with linters and structural tests ([OpenAI, 11 Feb 2026](https://openai.com/index/harness-engineering/); openai.com returned 403, so details come via [InfoQ, 21 Feb 2026](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex) and [Böckeler's memo](https://martinfowler.com/articles/harness-engineering.html)). Treat it as an existence proof under ideal greenfield conditions, not a norm.

**Anthropic's Claude Code team: review redesigned, not removed.** This is the most concrete published team process ([How the Claude Code team does code review, 15 Oct 2026](https://claude.dev/blog/solving-code-review-at-anthropic/)):
- The agent verifies before anyone looks: tests, build and lint, plus a fresh-context review subagent.
- A short CLAUDE.md, plus a REVIEW.md written by code owners that says what failure looks like in that repo.
- Multi-agent AI review on every PR, which can block a merge.
- Risk-tiered human approval. The change sets the tier, not the author. An agent's approval never counts as a person's. The person who prompted the change is a required reviewer.
- Recurring findings get fixed at the source: a skill, a lint rule or an instruction file.

They report that from June to September 2026 merged PRs more than doubled while the revert share fell by more than 40%. The post ends with a list of the parts a small team can adopt (same source). This is vendor-internal and at large scale. Boris Cherny adds that Claude-written production code should face a *higher* bar than human code ([via Willison, 11 Sep 2026](https://simonwillison.net/2026/Sep/11/boris-cherny/)).

### Dropped or folded in

- **Andrej Karpathy.** He coined "vibe coding" and reportedly proposed "agentic engineering" in February 2026. I only found secondary reports of the latter, and it adds nothing beyond Willison's definition.
- **Steve Yegge / Gas Town.** Represents the swarm end of the spectrum, which Thoughtworks places at Caution ([blip](https://www.thoughtworks.com/radar/techniques/coding-agent-swarms)).
- **Jesse Vincent's Superpowers.** Folded into the Radar paragraph.

---

## 2. Where they agree

1. **Verification is the core skill; typing isn't.** Willison ("confidently verify"), Hashimoto (give agents a way to verify their work), Huntley ("vision and verification"), Osmani ("Verification is the floor"), Böckeler (sensors) and the Claude Code team (the agent verifies before anyone looks) all say the same thing ([Willison](https://simonwillison.net/2026/Aug/22/more-than-just-code-review/), [Hashimoto](https://mitchellh.com/writing/my-ai-adoption-journey), [Huntley](https://ghuntley.com/agency/), [Osmani](https://addyosmani.com/blog/agentic-skill-decay/), [Böckeler](https://martinfowler.com/articles/harness-engineering.html), [Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic/)).
2. **When a mistake repeats, fix the system that produced it, not just the output.** Hashimoto's "engineer the harness", Morris's "on the loop", Osmani's corrections-to-harness, Huntley's commit hook, Böckeler's rule to improve the controls whenever an issue recurs, and Anthropic routing recurring review findings into skills and lint rules all express this ([Morris](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html), [Osmani](https://addyosmani.com/blog/brownfield-agentic-engineering/)).
3. **Think before code, in small steps.** Reed's spec → plan → todo, Beck's `plan.md` taken one test at a time, Horthy's research → plan → implement, Huntley's specs plus one item per loop, and Spec Kit's phases are the same shape. The Radar calls spec → plan → implement the common flow ([Radar SDD](https://www.thoughtworks.com/radar/techniques/spec-driven-development)). Even Böckeler, the SDD sceptic, values spec-*first* thinking and keeps small iterative steps as the real control ([SDD](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)).
4. **Deterministic gates beat prose.** Rules that must hold belong in tests, linters, types, hooks and permissions. Huntley, Osmani ("move hard constraints out of prose"), the Radar's feedback sensors and Böckeler's computational sensors agree ([Osmani audit](https://addyosmani.com/blog/audit-your-agent-files/), [Radar](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)).
5. **Fundamentals get amplified, good and bad.** DORA's "amplifier" thesis, Willison's vibe-engineering list of classic practices, the Radar theme "Retaining principles, relinquishing patterns", and DORA's seven capabilities (small batches, strong version control, AI-accessible internal data, and others) all line up ([DORA capabilities](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model), [Willison](https://simonwillison.net/2025/Oct/7/vibe-engineering/)).
6. **Don't hand unreviewed agent output to colleagues.** Willison's anti-pattern, Ghostty's "fully understand all code" rule and Anthropic's "the prompter counts as a reviewer" agree ([Willison](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/), [Ghostty](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md)).
7. **Agent guidance is a shared team asset in the repo, and should be kept small.** The Radar puts curated shared instructions at Adopt and instruction bloat at Caution. Osmani and Anthropic both say keep it short and include only what can't be inferred ([Radar Adopt](https://www.thoughtworks.com/radar/techniques/curated-shared-instructions-for-software-teams), [Radar Caution](https://www.thoughtworks.com/radar/techniques/agent-instruction-bloat)).

---

## 3. Where they disagree, and where the evidence cuts against the hype

### 3.1 Disagreements among practitioners

| Question | One side | Other side | Read |
|---|---|---|---|
| **TDD inside the agent loop?** | Beck prescribes red-green-refactor to the genie ([Jun 2025](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes)). Willison calls red/green TDD a top pattern ([Feb 2026](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/)). Superpowers enforces it ([Radar](https://www.thoughtworks.com/radar/languages-and-frameworks/superpowers)). | Böckeler's small experiment found no quality gain and 3–8.5× the tokens; she stopped prescribing it ([Aug 2026](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html)). | Everyone agrees that **tests as a sensor** are essential. **TDD as an agent ritual** is contested. Böckeler's sample was tiny and greenfield, and she ran Sonnet 4.6. |
| **Should a human read every line?** | Ghostty requires full human understanding ([policy](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md)). Cherny wants a *higher* bar for Claude-written code ([Sep 2026](https://simonwillison.net/2026/Sep/11/boris-cherny/)). | Willison says eyeballing every line has never been the best way to verify ([Aug 2026](https://simonwillison.net/2026/Aug/22/more-than-just-code-review/)). Morris calls "in the loop" a bottleneck ([Mar 2026](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html)). Horthy says review the plan, not the code ([2025](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). Anthropic exempts low-risk changes from human approval ([Oct 2026](https://claude.dev/blog/solving-code-review-at-anthropic/)). | The answer is **risk-tiered**: human attention goes where the blast radius is. Nobody credible says "no review". |
| **Heavy or light spec tooling?** | Spec Kit's gated phases, 142k stars ([repo](https://github.com/github/spec-kit)). | Böckeler: overkill and a review burden, with MDD déjà vu ([Oct 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). The Radar warns of spec files too long to review and suggests the field may be relearning the "bitter lesson" ([SDD blip](https://www.thoughtworks.com/radar/techniques/spec-driven-development)). | Spec Kit itself has softened (optional entry points, "any other process"). For brownfield work, delta specs (OpenSpec) fit better ([Radar](https://www.thoughtworks.com/radar/tools/openspec)). |
| **Is hand-coding over?** | Huntley: no place for engineers who type code by hand ([Oct 2026](https://ghuntley.com/agency/)). OpenAI ran an experiment with no manually written source code ([Feb 2026](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex)). | Hashimoto stays hands-on for what he cares about ([Feb 2026](https://mitchellh.com/writing/my-ai-adoption-journey)). Osmani: occasionally work problems by hand ([Aug 2026](https://addyosmani.com/blog/agentic-skill-decay/)). DORA warns about skipping the "productive struggle" ([Mar 2026](https://dora.dev/insights/balancing-ai-tensions/)). | The skill-formation RCT (§3.2) favours the second camp, at least for learning a new library. |
| **Parallel agents and swarms?** | Hashimoto's "always have an agent running", Huntley's loops, OpenAI's agent-to-agent review. | Beck isn't convinced swarms are the answer ([Apr 2026](https://newsletter.kentbeck.com/p/genie-lessons-nobody-wants-agents)). The Radar puts swarms at Caution because they're costly and immature ([blip](https://www.thoughtworks.com/radar/techniques/coding-agent-swarms)). Hashimoto himself runs one agent. | Teach one well-harnessed agent per person. Leave swarms out of scope. |
| **Does AGENTS.md help?** | Radar Adopt for curated shared instructions. Committed configuration correlates with less complexity growth ([RAMP, Aug 2026](https://arxiv.org/abs/2608.25241)). | Context files did not generally improve task success and cost over 20% more; repository overviews were unhelpful ([ETH, v3 Sep 2026](https://arxiv.org/abs/2602.11988)). Huntley's hook beat prose ([Oct 2026](https://ghuntley.com/agency/)). | Keep it **short, non-obvious and curated**, and back hard rules with tooling. Don't auto-generate a repo overview and call it done. |

### 3.2 Where the evidence cuts against the hype

- **Perceived ≠ measured speed.** In METR's RCT, 16 experienced open-source developers on 246 tasks were 19% *slower* with AI (early-2025 tools). They had expected to be 24% faster and still believed afterwards that they had been 20% faster (**RCT**, [METR, 10 Jul 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)). METR now labels those results out of date.
- **The follow-up broke the experiment.** In METR's late-2025 follow-up (57 developers, 800+ tasks), the estimated speedup was −18% for returning developers (CI −38% to +9%) and −4% for new ones (CI −15% to +9%). METR calls these unreliable because developers declined to participate rather than work without AI, and 30–50% withheld tasks they didn't want to do without it. METR believes the true speedup is probably higher, but its data is only weak evidence of how much (**RCT, compromised**, [METR, 24 Feb 2026](https://metr.org/blog/2026-02-24-uplift-update/)). *Slide angle:* the strongest current evidence of value is that developers won't give AI up, not a measured number.
- **Self-reports run high.** METR's survey of 349 technical workers (Feb–Apr 2026) found a median self-reported value gain of 1.4–2× and a median speed gain of 3×. METR warns that surveys overestimate gains and that some 10× answers looked overstated. It also reminds readers that in its RCT people misjudged AI's effect on their time by about 40 percentage points (**survey**, [METR, 11 May 2026](https://metr.org/blog/2026-05-11-ai-usage-survey/)).
- **Passing tests ≠ mergeable.** Four maintainers of scikit-learn, Sphinx and pytest reviewed 296 agent PRs that passed SWE-bench Verified. Roughly half would not have been merged. Maintainer scores ran about 24 percentage points below the automated grader (normalised against a baseline of human PRs that were actually merged). Code quality was the most common problem. Agents got a single attempt with no feedback (**obs./eval**, [METR, 10 Mar 2026](https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/)).
- **Velocity spikes; complexity persists.** In a difference-in-differences study of 807 GitHub projects that adopted Cursor (2024–25), development velocity rose sharply but only briefly, while static-analysis warnings and code complexity rose persistently. That complexity then slowed later velocity (**quasi-exp.**, [He et al., CMU, arXiv 2511.04427, MSR '26](https://arxiv.org/abs/2511.04427)).
- **AI raises throughput and instability at the same time.** DORA 2025 surveyed about 5,000 respondents. 90% use AI at work, more than 80% believe it raised their productivity, and 30% have little or no trust in AI-generated code. AI adoption now correlates positively with throughput but still negatively with delivery stability (**survey**, [Google Cloud, 23 Sep 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)). DORA's March 2026 follow-up names a "verification tax": time saved writing code is spent auditing it, and reviewers absorb the cognitive load the author saved ([DORA, 10 Mar 2026](https://dora.dev/insights/balancing-ai-tensions/)).
- **Expect a dip first.** DORA's ROI report models a J-curve with a temporary productivity drop and a higher change-failure rate before gains arrive. It advises against cutting headcount or estimates up front (**model**, [DORA ROI report, Apr 2026](https://dora.dev/ai/roi/report/); figures via [InfoQ, May 2026](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/)). The report cites Stanford research putting gains at 35–40% on simple greenfield work and about 10% or less on complex legacy code (same InfoQ source; the Stanford paper itself wasn't reachable, only [the talk](https://ai.engineer/talks/ai-developer-productivity)).
- **Delegating erodes learning.** In an RCT with 52 mostly junior engineers learning a new Python library, the AI group scored 17% lower on a follow-up quiz (50% vs 67%), with the biggest gap on debugging. There was no significant speed gain. Participants who asked conceptual questions or requested explanations kept most of the learning (**RCT**, [Anthropic, 29 Jan 2026](https://www.anthropic.com/research/AI-assistance-coding-skills)).
- **Throughput metrics backfire.** Thoughtworks puts *coding throughput as a measure of productivity* at Caution and recommends first-pass acceptance rate instead ([blip](https://www.thoughtworks.com/radar/techniques/coding-throughput-as-a-measure-of-productivity)). DORA calls token leaderboards ("tokenmaxxing") a case of Goodhart's law. It says company-wide aggregates are meaningless and individual scores are harmful, so measure at team level ([DORA, 2 Jun 2026](https://dora.dev/insights/finding-balance-in-the-era-of-tokenmaxxing/)).
- **Telemetry from tool vendors points the same way, so treat it as directional.** Faros found individual gains with no company-level improvement: 21% more tasks, 98% more PRs, 91% more review time ([Faros, Jul 2025](https://www.faros.ai/blog/ai-software-engineering)). Its 2026 telemetry from 22k developers reports PRs 51% larger and bugs per developer up 54% ([Faros Q2 2026](https://www.faros.ai/research/ai-acceleration-whiplash)). CodeRabbit found AI-co-authored PRs carried about 1.7× more issues ([CodeRabbit, 17 Dec 2025](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)). All three companies sell into this market.

### 3.3 Evidence that cuts *for* AI (so the deck stays balanced)

- **Pre-agent RCTs.** Three randomised field experiments at Microsoft, Accenture and a Fortune 100 company (4,867 developers, Copilot autocomplete) found 26% more completed tasks. Less experienced developers gained most (**RCT**, [Cui et al., *Management Science*](https://pubsonline.informs.org/doi/fpi/10.1287/mnsc.2025.00535)).
- **CLI agents at Microsoft.** In Microsoft's early-2026 rollout of Claude Code and Copilot CLI to tens of thousands of engineers, adopters merged about 24% more PRs than their counterfactual, and the lift held over four months. Adoption spread mainly through social networks. The authors note that a merged PR is not the same as delivered value (**obs./synthetic counterfactual**, [Murphy-Hill et al., arXiv 2607.01418, 1 Jul 2026](https://arxiv.org/abs/2607.01418)).
- **Developers want it.** In the Stack Overflow 2026 survey, 66% of AI users use coding agents and 73% of those use them daily. Favourable views outnumber unfavourable by about 3 to 1 (**survey**, [SO 2026](https://survey.stackoverflow.co/2026/ai)).

---

## 4. Slide-ready claims

Each claim is paraphrased. Check the source before quoting.

1. **"AI is an amplifier, not a fix."** In DORA's 2025 survey of about 5,000 respondents, AI adoption raised throughput but still lowered delivery stability. Seven capabilities decided who benefits, including small batches, strong version control, AI connected to internal context, and a clear AI stance.
   [DORA 2025 report announcement, 23 Sep 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) · [AI Capabilities Model, 23 Sep 2025](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model)
2. **"You can't feel your own productivity."** Experienced developers were 19% slower with early-2025 AI tools but believed they were 20% faster. By 2026 the trial couldn't be rerun cleanly because developers refused to work without AI.
   [METR, 10 Jul 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) · [METR, 24 Feb 2026](https://metr.org/blog/2026-02-24-uplift-update/)
3. **"Green tests ≠ mergeable code."** Maintainers would reject roughly half of agent PRs that pass SWE-bench Verified's tests, mostly over code quality.
   [METR, 10 Mar 2026](https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/)
4. **"The speed fades; the complexity stays."** After adopting Cursor, projects saw a short velocity spike but a lasting rise in static-analysis warnings and complexity, which then slowed them down.
   [He et al., CMU, MSR '26, arXiv Nov 2025 / v3 Jan 2026](https://arxiv.org/abs/2511.04427)
5. **"Shared, committed agent config pays off, if it stays small."** Agent-first repos without committed AI configuration saw about twice the complexity growth (+53% vs +27%) and 1.7× the rise in static-analysis warnings (observational). Separately, context files did not generally improve task success and raised cost by over 20%.
   [RAMP, arXiv 2608.25241, 26 Aug 2026](https://arxiv.org/abs/2608.25241) · [Gloaguen et al., arXiv 2602.11988, v3 29 Sep 2026](https://arxiv.org/abs/2602.11988) · [Radar: agent instruction bloat (Caution), 15 Apr 2026](https://www.thoughtworks.com/radar/techniques/agent-instruction-bloat)
6. **"Trust what you can verify."** Developers trust AI when they can easily check it (48%). Only about 7% trust it for important decisions. Project goals and requirements are the most trusted context (85%). Claude Code (66%) and Copilot (59%) lead agent use.
   [Stack Overflow survey results post, 6 Oct 2026](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/) · [Stack Overflow 2026 AI results](https://survey.stackoverflow.co/2026/ai) · [The Register, 10 Oct 2026](https://www.theregister.com/software/2026/10/10/stack-overflow-survey-finds-devs-hooked-on-ai-but-not-totally-sold-on-its-judgment/5301662) (the 7% figure)
7. **"Agents help individuals, not (yet) teams."** In 2025, about 69% of agent users said agents raised their productivity, but only 17% said agents improved team collaboration.
   [Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai)
8. **"Delegation costs learning; curiosity preserves it."** In an RCT, AI-assisted juniors scored 17% lower on mastery (biggest gap: debugging), with no significant speed gain. Those who asked "why" kept most of the learning.
   [Anthropic, 29 Jan 2026](https://www.anthropic.com/research/AI-assistance-coding-skills)
9. **"Review moves; it doesn't disappear."** The Claude Code team verifies at the author side, runs AI review on every PR, and tiers human approval by risk. An agent's approval never counts as a person's. Merged PRs doubled while the revert share fell by over 40% (vendor-internal, at scale).
   [claude.dev, 15 Oct 2026](https://claude.dev/blog/solving-code-review-at-anthropic/)
10. **"Tests as sensors, not TDD theatre."** Prescribing TDD to an agent produced no clear quality gain at 3–8.5× the tokens in a small experiment. The durable idea is tests and checks the agent runs on itself, with humans specifying what "correct" means.
    [Böckeler, 10 Aug 2026](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html) · [Böckeler, harness engineering, 2 Apr 2026](https://martinfowler.com/articles/harness-engineering.html)

Backup claims:
- Thoughtworks calls individuals writing prompts from scratch an anti-pattern and puts curated, committed team instructions at **Adopt** ([15 Apr 2026](https://www.thoughtworks.com/radar/techniques/curated-shared-instructions-for-software-teams)).
- DORA says company-wide AI usage aggregates are meaningless and individual scores harmful ([2 Jun 2026](https://dora.dev/insights/finding-balance-in-the-era-of-tokenmaxxing/)).

---

## 5. Especially relevant to test automation, specs and team harmonisation

### Test automation

- **Tests are the agent's backpressure.** Make them fast, runnable by the agent, and run *before* commit. This is the Radar's feedback sensors at Trial ([blip](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)), Huntley's backpressure ([Ralph](https://ghuntley.com/ralph/)), and Ronacher's fast, quiet tools ([2025](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)). "First run the tests" is a one-line prompt that does a lot ([Willison](https://simonwillison.net/guides/agentic-engineering-patterns/first-run-the-tests/)).
- **Separate the test author from the implementer.** Osmani says the session that makes the tests pass shouldn't be the only author of those tests ([brownfield](https://addyosmani.com/blog/brownfield-agentic-engineering/)). In the Datasette security work, one person wrote the failing tests and the other the fix, so two humans saw every issue ([Willison, 11 Sep 2026](https://simonwillison.net/2026/Sep/11/datasette-security/)). Beck watches for agents deleting or disabling tests ([2025](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes)). *Workshop fit:* within a group, one person or agent writes acceptance tests from the spec and another implements.
- **Brownfield starts with characterization tests** that pin current behaviour before anything changes ([Osmani](https://addyosmani.com/blog/brownfield-agentic-engineering/)). This fits the case directly, an existing .NET + React app.
- **Check the AI's tests.** Use mutation testing and static analysis to judge AI-written tests, rather than trusting a green suite with good coverage ([Böckeler harness](https://martinfowler.com/articles/harness-engineering.html), [TDD experiment](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html)).
- **Behaviour is where humans are irreplaceable.** If nobody specified the correct behaviour, no sensor can catch its absence ([Böckeler](https://martinfowler.com/articles/harness-engineering.html)). Jain's harness worked because humans encoded clear contracts and examples (OpenAPI specs plus request/response examples) ([Oct 2026](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html)). *Workshop fit:* this is where the product owners add the most value, through acceptance examples written in the spec.
- **DORA says invest in test automation before tuning manual review,** and keep batches small ([Mar 2026](https://dora.dev/insights/balancing-ai-tensions/)). In Stack Overflow 2026, 58% already use AI for writing or improving tests ([SO 2026](https://survey.stackoverflow.co/2026/ai)).

### Specs

- **The consensus shape is spec → plan → implement in small steps** ([Radar SDD](https://www.thoughtworks.com/radar/techniques/spec-driven-development)). Right-size it. Heavy templates blew a small bug up into 16 acceptance criteria ([Böckeler](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). On brownfield work, delta specs (OpenSpec) beat full specs ([Radar](https://www.thoughtworks.com/radar/tools/openspec)).
- **Specs carry intent, not just implementation:** goals, constraints, non-goals and definition of done ([Osmani, intent debt](https://addyosmani.com/blog/intent-debt/)). Developers trust project goals and requirements more than any other context (85%) ([SO 2026](https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/)).
- **Review upstream.** A short plan or research note is reviewable. A 2,000-line diff isn't ([Horthy](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). This supports the map's spec review checkpoint before agents build.
- **Who writes the spec is an open question.** Böckeler flags that SDD tools don't say who the spec author is ([SDD](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). With two POs in the room, the workshop can answer that question for Dynatos.
- **Spec Kit as a cross-tool option.** It has 38 integrations (Copilot, Claude, Codex and others), and its phases are now optional entry points ([site](https://github.github.com/spec-kit/)). It's reasonable to show, but the Radar ring is Assess, and its verbosity needs taming ([blip](https://www.thoughtworks.com/radar/languages-and-frameworks/github-spec-kit)).

### Team harmonisation

- **Commit a curated, minimal set of shared instructions.** Use AGENTS.md (cross-tool) plus skills, and keep it to what can't be inferred: how to run checks, files not to touch, unusual conventions. The sources are the Radar's Adopt and Caution blips, Osmani's [audit post](https://addyosmani.com/blog/audit-your-agent-files/) and the [ETH study](https://arxiv.org/abs/2602.11988).
- **Give the config an owner and a review cadence.** 73.8% of committed AI-config artefacts are never modified after they're added ("set-and-forget") ([RAMP](https://arxiv.org/abs/2608.25241)). Osmani audits monthly ([audit](https://addyosmani.com/blog/audit-your-agent-files/)).
- **Turn recurring review comments into REVIEW.md entries, lint rules or skills.** Add a PR template with *how tested* and *how to revert*, CODEOWNERS for risky paths, and an AI reviewer on every PR. Anthropic's small-team list covers all of this ([claude.dev](https://claude.dev/blog/solving-code-review-at-anthropic/)).
- **Rebuild the friction you removed.** Agents let people change the system without talking to each other, and shared understanding decays ([Ronacher](https://lucumr.pocoo.org/2026/7/13/the-tower-keeps-rising/); [Radar: codebase cognitive debt, Caution](https://www.thoughtworks.com/radar/techniques/codebase-cognitive-debt)). Stand-ups, spec reviews and walkthroughs become *more* important, not less.
- **Treat uneven adoption as a feedback-loop design problem.** Majors' enthusiast–sceptic framing ([Majors](https://charitydotwtf.substack.com/p/ai-enthusiasts-are-in-a-race-against)) and Hashimoto's ladder, which starts by reproducing your own commits with the agent ([Hashimoto](https://mitchellh.com/writing/my-ai-adoption-journey)), give a non-judgemental path for the less engaged. At Microsoft, adoption spread through social networks ([arXiv 2607.01418](https://arxiv.org/abs/2607.01418)), which supports the workshop's mixed groups.
- **Measure at team level, and measure collaboration quality, not volume.** Track first-pass acceptance rate, review rounds, post-merge rework and failed builds ([Radar](https://www.thoughtworks.com/radar/techniques/measuring-collaboration-quality-with-coding-agents)). Don't build token or PR leaderboards ([DORA](https://dora.dev/insights/finding-balance-in-the-era-of-tokenmaxxing/)).
- **Publish a clear AI stance.** This is DORA capability #1: what's allowed, what's expected, and which tools ([DORA](https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model)). Ghostty's disclosure-plus-understanding policy is a compact public example ([Ghostty](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md)).

---

## 6. What could change the workshop design

1. **Don't teach "make the agent do TDD" as dogma.** As of August 2026 there is a credible counter-experiment ([Böckeler](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html)). Teach the parts nobody disputes:
   - Human-specified acceptance examples in the spec.
   - Characterization tests on the brownfield case.
   - Tests the agent runs on itself before commit.
   - Separate test and implementation authorship.

   If the `tdd` skill from issue 04 is demoed, frame it as one option and say why. Pocock's version, red-green at test seams the humans agreed in the spec ([pocock-and-tan.md](pocock-and-tan.md)), already sits closer to Böckeler's point. The value comes from humans deciding what to test, not from the ritual. A two-group comparison (TDD prompt vs test-first-from-spec) could even become a retrospective talking point.
2. **Make review a first-class block, not an afterthought.** Every serious source says the bottleneck moves to review and verification (DORA, Faros, CMU, Anthropic). The Day 1 PR flow could use a REVIEW.md, a PR template with *how tested / how to revert*, an AI reviewer pass, and a simple risk tier. Those are the cheap items from Anthropic's small-team list.
3. **Keep the AGENTS.md template short, and say why.** Evidence now shows that bloated or auto-generated context files don't help and cost tokens. The takeaway template should be a skeleton of *non-inferable* items plus a named owner and review cadence. It should not be a long, comprehensive file. A one-minute live `/init`-vs-curated comparison would make the point.
4. **Measure something, because feelings are unreliable.** METR showed a perception gap of around 40 percentage points. Have the live deck or reporter show team-level collaboration signals (first-pass acceptance, review rounds, rework) rather than speed claims. This also fits the retrospective.
5. **Guard learning for the less experienced.** The skill-formation RCT shows the "conceptual inquiry" mode preserves learning. In mixed groups, the less experienced member should drive the agent *and* explain the diff. The "highest-value minute" is reading the diff and predicting what could still fail ([Osmani](https://addyosmani.com/blog/agentic-skill-decay/)).
6. **Lightweight specs for a foggy brownfield epic.** Use spec → plan → small tasks with delta specs and explicit intent (goals, constraints, non-goals, acceptance examples). Show Spec Kit only as a cross-tool option, not the default. Give the POs ownership of the acceptance examples.
7. **Leave swarms and parallel multi-agent setups out of scope.** The Radar says Caution, Beck is sceptical, and Hashimoto runs one agent. One well-harnessed agent per person is the honest 2026 baseline.
8. **Use Majors' enthusiast–sceptic loop or Hashimoto's ladder to frame the opener.** Both treat sceptics as a safeguard and give them an on-ramp. That matches the "lift everyone a level" goal better than a capabilities showcase.

---

## Gaps and caveats

- **DORA in 2026.** I found no 2026 *State of AI-assisted Software Development* report. One secondary source says DORA is skipping its annual survey in 2026 ([Waydev, 4 Sep 2026](https://waydev.co/dora-pauses-the-annual-survey/)), but I couldn't confirm that on dora.dev. The newest DORA outputs are the ROI report (April 2026) and the insight posts cited above.
- **Thoughtworks Radar Vol. 35** wasn't published as of 2026-10-20. The radar page still shows Vol. 34 ([radar](https://www.thoughtworks.com/radar)). The SDD blip was not carried into Vol. 34, but Spec Kit and OpenSpec were.
- **DORA ROI report.** The full report is gated on Google Cloud. The J-curve and ROI figures come via [InfoQ](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/), and the report's landing page is [dora.dev/ai/roi/report](https://dora.dev/ai/roi/report/).
- **OpenAI harness engineering.** openai.com returned 403. Details come via InfoQ and Böckeler.
- **Stanford (Denisov-Blanch) greenfield/brownfield numbers** come only from a talk and from DORA's citation. I found no paper.
- **Small or narrow samples.**
  - Böckeler's TDD experiment: a handful of runs, greenfield only, with Sonnet 4.6.
  - Jain's harness study: one Java service, 10 runs per condition.
  - The Anthropic skills RCT: n=52, short-term.
  - RAMP and the CMU study are observational or quasi-experimental and come from open-source repos.
- **Possible bias.**
  - Osmani, Cherny and the Claude Code review post are Anthropic.
  - Faros and CodeRabbit sell into the market.
  - OpenAI's write-up promotes Codex.
  - The Microsoft study covers Microsoft's own rollout, including GitHub Copilot CLI.
- **Stack Overflow 2026 sample.** Over 30,000 took the survey, but individual questions have smaller *n*. The "7% trust for important decisions" figure is from The Register's reading; the full-data page wasn't checked.
- **Harper Reed and Armin Ronacher** have no substantive 2026 workflow updates beyond what's cited. Their 2025 posts remain the reference.

---

## Sources (with dates)

**Practitioners**
- Kent Beck, *Augmented Coding: Beyond the Vibes*, 25 Jun 2025: https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes
- Kent Beck, *Genie Sessions: TCR Skill*, 1 Apr 2026: https://newsletter.kentbeck.com/p/genie-sessions-tcr-skill
- Kent Beck, *Genie Lessons: Nobody Wants Agents*, 23 Apr 2026: https://newsletter.kentbeck.com/p/genie-lessons-nobody-wants-agents
- Simon Willison, *Vibe engineering*, 7 Oct 2025: https://simonwillison.net/2025/Oct/7/vibe-engineering/
- Simon Willison, *Your job is to deliver code you have proven to work*, 18 Dec 2025: https://simonwillison.net/2025/Dec/18/code-proven-to-work/
- Simon Willison, *Agentic Engineering Patterns* guide, from 23 Feb 2026: https://simonwillison.net/guides/agentic-engineering-patterns (chapters: [what is](https://simonwillison.net/guides/agentic-engineering-patterns/what-is-agentic-engineering/), [code is cheap](https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/), [anti-patterns](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/), [red/green TDD](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/), [first run the tests](https://simonwillison.net/guides/agentic-engineering-patterns/first-run-the-tests/))
- Simon Willison, *More than just code review*, 22 Aug 2026: https://simonwillison.net/2026/Aug/22/more-than-just-code-review/
- Simon Willison, Datasette security releases, 11 Sep 2026: https://simonwillison.net/2026/Sep/11/datasette-security/
- Boris Cherny quote via Willison, 11 Sep 2026: https://simonwillison.net/2026/Sep/11/boris-cherny/
- Birgitta Böckeler, *Understanding Spec-Driven-Development*, 15 Oct 2025: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- Birgitta Böckeler, *Harness engineering for coding agent users*, 2 Apr 2026: https://martinfowler.com/articles/harness-engineering.html
- Birgitta Böckeler, *TDD inside the agent loop: theater or actual value?*, 10 Aug 2026: https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html
- Kief Morris, *Humans and Agents in Software Engineering Loops*, 4 Mar 2026: https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html
- Naresh Jain, *Are Harnesses Worth the Cost?*, 13 Oct 2026: https://martinfowler.com/articles/are-harnesses-worth-the-cost.html
- *Exploring Gen AI* series index: https://martinfowler.com/articles/exploring-gen-ai.html
- Addy Osmani, *The Intent Debt*, 5 Jun 2026: https://addyosmani.com/blog/intent-debt/
- Addy Osmani, *Audit your Agent files*, 27 Aug 2026: https://addyosmani.com/blog/audit-your-agent-files/
- Addy Osmani, *Agentic Skill Decay*, 31 Aug 2026: https://addyosmani.com/blog/agentic-skill-decay/
- Addy Osmani, *Brownfield Agentic Engineering*, 14 Sep 2026: https://addyosmani.com/blog/brownfield-agentic-engineering/
- Geoffrey Huntley, *Ralph Wiggum as a "software engineer"*, 14 Jul 2025: https://ghuntley.com/ralph/
- Geoffrey Huntley, *Agency*, 13 Oct 2026: https://ghuntley.com/agency/
- Harper Reed, *My LLM codegen workflow atm*, 16 Feb 2025: https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
- Armin Ronacher, *Agentic Coding Recommendations*, 12 Jun 2025: https://lucumr.pocoo.org/2025/6/12/agentic-coding/
- Armin Ronacher, *The Tower Keeps Rising*, 13 Jul 2026: https://lucumr.pocoo.org/2026/7/13/the-tower-keeps-rising/
- Mitchell Hashimoto, *My AI Adoption Journey*, 5 Feb 2026: https://mitchellh.com/writing/my-ai-adoption-journey
- Ghostty, *AI_POLICY.md* (undated, © 2026): https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md
- Dex Horthy, *Advanced context engineering for coding agents* (undated, ~Aug 2025): https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md
- Charity Majors, *AI enthusiasts are in a race against time…*, ~Jun 2026: https://charitydotwtf.substack.com/p/ai-enthusiasts-are-in-a-race-against (via https://simonwillison.net/2026/Jun/4/ai-enthusiasts-ai-skeptics/)

**Organisations**
- Thoughtworks Technology Radar Vol. 34, 15 Apr 2026: https://www.thoughtworks.com/radar (blips linked inline)
- GitHub, *Spec-driven development with AI*, 2 Sep 2025: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- GitHub Spec Kit repo: https://github.com/github/spec-kit ; site, updated 28 Sep 2026: https://github.github.com/spec-kit/
- OpenAI, *Harness engineering*, 11 Feb 2026: https://openai.com/index/harness-engineering/ (via InfoQ, 21 Feb 2026: https://www.infoq.com/news/2026/02/openai-harness-engineering-codex)
- Addy Osmani, Morgan Westlee Lunt, Qing Wang, *How the Claude Code team does code review*, 15 Oct 2026: https://claude.dev/blog/solving-code-review-at-anthropic/

**Evidence**
- DORA 2025 report announcement, 23 Sep 2025: https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report
- DORA AI Capabilities Model, 23 Sep 2025: https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model
- DORA, *Balancing AI tensions*, 10 Mar 2026: https://dora.dev/insights/balancing-ai-tensions/
- DORA, *ROI of AI-assisted Software Development*, Apr 2026: https://dora.dev/ai/roi/report/ (summary: https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/)
- DORA, *Finding balance in the era of tokenmaxxing*, 2 Jun 2026: https://dora.dev/insights/finding-balance-in-the-era-of-tokenmaxxing/
- METR, early-2025 developer RCT, 10 Jul 2025: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- METR, uplift study update, 24 Feb 2026: https://metr.org/blog/2026-02-24-uplift-update/
- METR, SWE-bench-passing PRs vs maintainers, 10 Mar 2026: https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/
- METR, AI usage survey, 11 May 2026: https://metr.org/blog/2026-05-11-ai-usage-survey/
- Stack Overflow Developer Survey 2025, AI: https://survey.stackoverflow.co/2025/ai
- Stack Overflow Developer Survey 2026, 6 Oct 2026: https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/ and https://survey.stackoverflow.co/2026/ai
- Shen and Tamkin (Anthropic), *How AI assistance impacts the formation of coding skills*, 29 Jan 2026: https://www.anthropic.com/research/AI-assistance-coding-skills
- He et al. (CMU), *Does AI-Assisted Coding Deliver?*, arXiv 2511.04427, Nov 2025 (v3 Jan 2026, MSR '26): https://arxiv.org/abs/2511.04427
- Murphy-Hill, Butler, Savelieva (Microsoft), *Adoption and Impact of Command-Line AI Coding Agents*, arXiv 2607.01418, 1 Jul 2026: https://arxiv.org/abs/2607.01418
- Denisov-Blanch et al., *A Few Pages of Markdown* (RAMP), arXiv 2608.25241, 26 Aug 2026: https://arxiv.org/abs/2608.25241
- Gloaguen et al. (ETH), *Evaluating AGENTS.md*, arXiv 2602.11988, Feb 2026 (v3 29 Sep 2026): https://arxiv.org/abs/2602.11988
- Cui et al., *The Effects of Generative AI on High-Skilled Work*, *Management Science* 2025: https://pubsonline.informs.org/doi/fpi/10.1287/mnsc.2025.00535
- Faros AI, *AI Productivity Paradox*, 23 Jul 2025 (vendor): https://www.faros.ai/blog/ai-software-engineering ; *AI Engineering Report Q2 2026* (vendor): https://www.faros.ai/research/ai-acceleration-whiplash
- CodeRabbit, *State of AI vs Human Code Generation*, 17 Dec 2025 (vendor): https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report
