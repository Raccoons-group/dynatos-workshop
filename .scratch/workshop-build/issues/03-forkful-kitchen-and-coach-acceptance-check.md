# 03: Forkful kitchen and the coach-only acceptance check

**What to build:** A restaurant chosen in "Acting as" sees incoming orders in the Kitchen, accepts or rejects them, moves them along and marks dishes sold out. The full seed data is there. A coach can prove every planted item against the running API without anything about them being committed.

**Blocked by:** 02

**Status:** claimed

Spec: [../spec.md](../spec.md)

- [x] The Kitchen page: incoming orders, accept or reject, move the status along, mark a dish sold out.
- [x] Full seed data: 6 restaurants (one only opens in the evening), about 60 dishes, 8 customers at 3 office addresses, and a few past and in-progress orders.
- [x] The case README holds the run and test commands and nothing else.
- [x] A coach-only acceptance script in the gitignored coach folder exercises every planted item against the running API, and it passes.
- [x] The case is about 2,000 lines, with about 15 files per side. It has exactly three API tests and one web test, and no Playwright. (About 880 API lines in 16 source and 3 test files; about 1,075 web lines in 15 source files, plus 330 lines of CSS.)
- [ ] CI is green. (`pnpm test` is green locally with the commands the workflow runs. It needs a push to prove it on GitHub.)
- [x] The coach-notes leak check (or a manual grep until ticket 10 exists) finds nothing outside the case's source code. (Manual grep on 22 Oct: nothing from this build.)
