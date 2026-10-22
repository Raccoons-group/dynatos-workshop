# Case brief: Forkful

> Prototype for [Case brief: a neutral brownfield app with a foggy epic](../issues/08-case-brief-a-neutral-brownfield-app-with-a-foggy-epic.md). Agreed on 20 Oct 2026 as the basis for building the case. It isn't a spec yet, and nothing has been built.
>
> **Spoilers.** What groups are meant to discover lives in the coach notes (`.scratch/workshop/coach/coach-notes.md`), which are never committed until after the Day 2 retrospective. See [How groups work in the repo](../issues/13-how-groups-work-in-the-repo.md).

## Settled so far

- **Domain:** food delivery. **Epic:** group orders.
- **No planted bug.** What there is to discover is in the coach notes.
- **Each group works on one computer together**, and the group makes its own product decisions. There's no stakeholder to interview and no answer card.

## In one paragraph

Forkful is a small food delivery app for one city. It works. Customers browse restaurants, fill a basket, place an order and follow its status. Restaurants see incoming orders in a kitchen view, accept them and move them along. Product now wants **group orders**: one colleague starts an order for the office lunch, the others add their own food, and it all arrives as one delivery. The epic reads the way real epics arrive: a paragraph of intent, a list of half-agreed ideas, and no acceptance criteria. Every group gets the same app and the same issue.

## Why this epic

- Everyone in the room has organised an office lunch, so there's no domain onboarding and no language barrier.
- It has real product decisions behind it: how colleagues join, when the order closes, who can change what, and how the minimum order and the delivery fee work for a group. The group has to make those calls itself, which gives a PO in the group a natural lead.
- It has two obvious traps to cut: several restaurants in one group order, and splitting the bill. The app has no payments at all, so splitting the bill is a payments feature in disguise.
- It brings new vocabulary (group order, host, participant, "shared basket", "team order") that a glossary has to settle.
- It slices cleanly into vertical slices through the API and the UI, and its deadline makes for a good testing moment.

**Other food-delivery epics considered**

| Epic                   | Why it isn't the first choice                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Sold-out substitutions | A restaurant runs out after the order is placed. Good fog with two personas, but less relatable than a group lunch. |
| Order ahead            | Time slots and opening hours would swallow the afternoon.                                                   |
| Live order tracking    | Mostly plumbing (polling or SignalR, couriers), with little product fog.                                     |

## The starting app

Small enough for an agent to read all of it in one go (about 2,000 lines in total). Big enough to have some history: rules nobody wrote down, and names that drifted.

|       | API: `case/api`                                                                                                     | Web: `case/web`                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Stack | .NET 10 (LTS), ASP.NET Core controllers, EF Core on SQLite (a file, no Docker), seeded on startup                    | React 19, Vite, TypeScript, React Router, plain `fetch`                                                  |
| Size  | About 15 files, about 1,000 lines                                                                                    | About 15 files, about 1,000 lines                                                                         |
| Shape | `RestaurantsController`, `OrdersController`, `KitchenController`; an `OrderService` holding the ordering rules; `ForkfulDbContext` | Pages: Restaurants, Menu (with the basket), Checkout, My orders, Kitchen. An "Acting as" switcher (a customer or a restaurant) instead of a login |
| Tests | `Forkful.Api.Tests`: xUnit with `WebApplicationFactory`, three happy-path tests                                       | Vitest and Testing Library set up, with one smoke test                                                   |

**What already works**

- Restaurants: a list with a cuisine filter and an open/closed badge.
- Menu: dishes by category, sold-out dishes greyed out, add to basket. The basket lives in the browser.
- Checkout: delivery address, subtotal, delivery fee, place the order. There are no payments; orders are paid on delivery.
- My orders: the acting customer's orders with their status (Placed, Accepted, Preparing, Out for delivery, Delivered, Cancelled), and a cancel button.
- Kitchen, for the acting restaurant: incoming orders, accept or reject, move the status along, mark a dish sold out.
- Seed data: 6 restaurants (one only opens in the evening, so it's closed during the workshop), about 60 dishes, and 8 customers spread over 3 office addresses, with a few past orders and a couple in progress.
- `pnpm dev` runs both apps. `pnpm test` runs both test suites, locally and in CI on every PR.
- The API serves an OpenAPI document at `/openapi/v1.json`.

**Which tests exist**

- API: listing restaurants returns the seed data; a restaurant's menu returns its dishes; placing a valid order returns 201.
- Web: the restaurant list renders from a mocked API.
- Nothing covers the minimum order, the delivery fee, opening hours, cancelling, status changes or the kitchen view. There are no end-to-end tests and no Playwright.

## The foggy epic (GitHub issue)

Filed once in the repo with the label `epic`. Groups read it with the GitHub-issue skill ([Starter skill library and AGENTS.md template](../issues/16-starter-skill-library-and-agents-md-template.md)).

> **Group orders for the office lunch**
>
> Our business customers tell us the same story every week. At lunch, one person collects everyone's order in a chat, retypes it all into Forkful, and then spends the afternoon chasing colleagues for money. Orders get missed, somebody always wants "one more thing" after it's been placed, and the restaurant gets five separate orders for the same address at the same time.
>
> We want group orders: one person starts one, colleagues add their own food, and it arrives as one delivery.
>
> Things that came up when we discussed it (we didn't all agree):
>
> - How do colleagues join? A link? A code? Do they need an account?
> - There should be a deadline, so it doesn't stay open forever.
> - Can people pick different restaurants in the same group order?
> - Who can change or remove what?
> - Splitting the bill would be amazing.
> - What happens to the minimum order and the delivery fee?
> - Restaurants want to see that it's a group order, so they can pack it per person.
>
> Ideally before the new year, when the offices fill up again.
>
> — Forkful product team

What makes it foggy:

- "Join" isn't defined, and the app has no real accounts, only the "Acting as" switcher.
- "A deadline" has no time, no owner and no rule for latecomers.
- Several restaurants in one order is a different feature in disguise.
- Splitting the bill is a payments feature, and the app has no payments.
- It runs into existing ordering rules (details in the coach notes).

## Coach only

What is deliberately missing, what is planted, and a reasonable first cut are in the coach notes (`.scratch/workshop/coach/coach-notes.md`, gitignored until after the Day 2 retrospective).

## Done by the end of Day 1

Nobody finishes the epic: deciding what to cut is part of the exercise. Every group should have the following in its PR or PRs:

1. **Context.** A short `case/AGENTS.md` (commands, conventions, the rules an agent can't infer) and a glossary for the case, both written by the group.
2. **Spec.** Intent, what's in and out of scope, and acceptance examples. A coach reviews it at the spec review checkpoint before any agent builds.
3. **Tickets.** The epic as vertical slices, each with a line on how it will be proved, and the shipped ones marked.
4. **A shipped slice.** At least slice 1 through the API and the UI, with automated tests that encode its acceptance examples, green in CI.
5. **Working-out.** The how-we-worked note (the tool used, what the agent got wrong, what the group would do differently) and any skill the group wrote.

**Stretch:** slices 2 and 3 (placing the group order and the deadline), characterization tests for the existing ordering rules, and a skill the group wrote and used.

## Does it fit one afternoon?

A rough pass of about 3.5 hours for a group at one computer. The agenda ticket owns the real timings.

| Time   | What                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| 45 min | Explore the app with the agent, grill the epic together, and write AGENTS.md and the glossary along the way  |
| 30 min | Spec with acceptance examples                                                                                |
| 15 min | Spec review checkpoint                                                                                       |
| 15 min | Tickets                                                                                                      |
| 75 min | Build slice 1, tests first at the agreed seam, then slice 2 if there's time                                  |
| 15 min | Review and open the PR                                                                                       |

Slice 1 is one new table with its lines, three or four endpoints, a "Start group order" button, a join screen and a combined basket. That's the most a single computer should take on in 75 minutes with an agent. If the dry run shows it doesn't fit, split the join off into its own slice.

## Open questions

1. **For whoever builds it.** Controllers or minimal APIs, and what else would make the code feel familiar to a .NET team without copying anything of Dynatos's? Do participants run Windows? That affects SQLite, the `pnpm dev` script and the dry run.
2. **Nested AGENTS.md.** Codex and Copilot CLI only load `case/AGENTS.md` when they're started in `case/`, and VS Code doesn't load it at all by default. Do we tell groups to start their agent in `case/` and add a pointer in the root AGENTS.md? This one belongs to [Starter skill library and AGENTS.md template](../issues/16-starter-skill-library-and-agents-md-template.md).
