# Live-deck pipeline spike

Type: prototype (HITL)
Status: open
Blocked by: 01, 02, 07, 09

## Question

Does the end-to-end path work? A PR on the GitHub repo triggers a GitHub Action, which runs a stub reporter skill, which writes structured data, which the deck then shows, all without a coach touching anything.

Spike it with a dummy PR and a stub skill. Measure the latency from PR to slide, and confirm the local fallback works (a coach runs the same skill on their own machine).
