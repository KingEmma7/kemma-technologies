# Two weeks of Open Source Everyday: the process, the contributions, and what changed

By Emmanuel Tagbor · Open Source Everyday · Record checked 21 September 2026

I’m building a regular open-source contribution practice with AI assistance. The process starts before any code changes: find a useful problem, check the project’s rules, understand the existing behaviour, and decide what a good fix would need to prove.

My current setup is Codex with Astra. I’ve found it helpful for working through unfamiliar repositories. I use Codex to investigate repositories, implement changes, run checks and prepare reviews. I choose the work, make scope decisions and review the results. Maintainers make the decisions about their projects. Keeping those responsibilities visible is part of what I want to share through Open Source Everyday.

The practice began with setup on 7 September. The first recorded submission was on 9 September. As of 21 September, the record contains 12 submitted pull requests, 11 merged and one awaiting review. Those are contribution outcomes, not a claim of fourteen completed daily sessions.

## How a contribution moves from an issue to a PR

**Investigate → agree the scope → implement → verify → follow through**

Scouting includes checking whether the issue is still open, whether someone else has started a fix, and whether the repository permits the intended use of AI. A promising issue can become unavailable between discovery and implementation, so those checks happen again before publication.

Once I select a contribution, its repository gets a dedicated working task. The brief includes the problem, source links, contribution rules, duplicate checks, scope and validation plan. The planning record keeps the overall status. That separation helps preserve context when a maintainer responds days later.

The implementation then needs evidence. Depending on the change, that can mean a test that fails on the original code, a real command-line invocation, a request through the application, or source and documentation checks. We record what each check establishes and what it leaves untested.

I also made a full review of the affected behaviour a standing requirement. Codex performs that review and records the findings before publication. Since 17 September, I’ve authorised selected contributions to proceed to a PR when that review passes, with my review afterward. That is the current workflow; it does not mean I manually run every test or inspect every line before every submission.

Repository rules still apply, including any required disclosure or human review. New scope decisions come back to me, and we keep local validation, hosted checks and an actual merge as separate milestones.

## A test should make the wrong behaviour visible

One of the clearest examples came from [MiniSearch #2671](https://github.com/felladrin/MiniSearch/pull/2671), which fixed a settings listener that remained subscribed after it had served its purpose.

The tests exercised the real settings mechanism and permission component. The maintainer then removed the unsubscribe call and reported that two of the three tests failed. That gave us evidence that the tests could detect the bug returning.

But our next examples also showed that passing tests can leave gaps.

In [django-ox #67](https://github.com/oxpull/django-ox/pull/67), my contribution made an unknown worker-backend name produce a clear error before startup. Our original valid-backend test gave two backend names the same configuration. It could pass even if the command selected the wrong one.

Before merging, PhiLily strengthened the tests to check both the selected backend name and the implementation loaded for it. The follow-up also corrected a supposed default-configuration test: deleting a setting had left cached configuration in use, so our earlier claim about what that test proved was too strong.

We’ve added both lessons to the review checklist. Alternative configurations should behave differently enough for a wrong choice to fail. Tests of missing settings must also account for cached state.

## Where AI fits, and what the evidence can say

For [EvalRepro #52](https://github.com/seva9523/EvalRepro/pull/52), Codex implemented the tests and ran validation. I reviewed the implementation and approved submission. The change checked that custom snapshot options reached the manifest without changing production behaviour.

Other contributions had different limits. [barakoCMS #748](https://github.com/BaryoDev/barakoCMS/pull/748) involved source and documentation checks, with no local .NET build or runtime tests. Its detailed account needs to preserve that limit.

The same care applies after a merge. Maintainers may amend a patch, and a dependency change may land separately before the PR merges. The final article should describe the final change and credit that work, rather than repeat the original PR description unchanged.

I estimate that a contribution takes around one to two hours across scouting, selecting an issue, reading contribution instructions, implementing, reviewing, pushing and following up on checks. That is my estimate of the work involved, not a stopwatch measurement or a promise that every contribution fits that window. Maintainer review can happen later. We’ve also started recording task timing to compare future estimates with observed work.

## Tooling and validation in practice

The tools depend on the repository and the behaviour being changed. For [django-ox #67](https://github.com/oxpull/django-ox/pull/67), the work involved Python environments, a containerised database, real command-line tests and static checks. Codex performed the setup and execution; I directed the contribution and reviewed the results.

### Isolated environments and database behaviour

Python virtual environments kept project dependencies separate. The command tests ran on Python 3.12 with Django 5.2.17 and its django-tasks backport, Django 6.0.8, and Django 6.1.1. Checking multiple versions helped assess the compatibility path rather than assuming the newest environment represented them all.

Docker ran a disposable PostgreSQL 16 database bound to the local machine. The repository requires both SQLite and PostgreSQL validation: a pass on SQLite alone does not establish behaviour on PostgreSQL. The container and its test volume were removed after testing. This was a local test service, not a deployment.

### Testing what the operator sees

A real `django-admin ox_worker --backend missing` invocation reproduced the original traceback. The regression checks covered both single-worker and multiprocess startup. After the fix, subprocess tests checked exit status, standard output, standard error and the explicit `--traceback` option.

That tests the command boundary as well as the internal validation. A unit test that observes an exception alone cannot establish the message an operator receives or whether the process exits correctly.

### Static checks, coverage and failed runs

Ruff checked lint and formatting, `mypy --strict src/` checked types, and `mkdocs build --strict` checked the documentation build. The repository’s release-consistency and migration checks also ran. These checks answer different questions; none substitutes for exercising the command.

The initial SQLite suite had 19 failures. All 19 passed in a targeted rerun after process-inspection permissions and generated documentation were addressed. Some failures directly showed process-access problems; the exact cause of every later timing failure was not established. The PostgreSQL run had one stale-documentation failure, which passed after regeneration. The audit preserved those results rather than describing the first runs as clean passes.

Combined SQLite coverage reached 94.73%, but the maintainer’s later test corrections still found gaps in what we had proved. Coverage measures code execution, not whether the assertions distinguish every wrong result.

### Local evidence and the merged version

The local audit refers to the submitted commit. PhiLily’s follow-up changed the tests and empty-configuration message before merge, and all 30 hosted checks passed on that revised head. Those checks included the database and framework matrix. MySQL coverage came from hosted CI, not a local MySQL run.

For [MiniSearch #2698](https://github.com/felladrin/MiniSearch/pull/2698), validation instead included a controlled real-model HTTP/client path and deliberate wrong-index and missing-sort mutations. The regression tests failed when those defects were introduced. That checked their sensitivity to the specific ranking errors, without claiming improved answer quality or production deployment.

## The contribution record

The first seven contributions were submitted from 9–15 September. The table includes those seven and the contributions that followed. Repository stars were checked on 21 September 2026; they describe repository interest, not the impact of an individual contribution.

| Contribution | Repository stars | What it covered | Status as of 21 September |
|---|---:|---|---|
| [Skill-audit #18](https://github.com/AgentPostmortem/Skill-audit/pull/18) | 3 | Missing script extensions in directory scans | Merged |
| [Skill-audit #19](https://github.com/AgentPostmortem/Skill-audit/pull/19) | 3 | Rejecting multiple scan paths | Merged |
| [EvalRepro #52](https://github.com/seva9523/EvalRepro/pull/52) | 1 | Snapshot-option propagation tests | Merged |
| [barakoCMS #748](https://github.com/BaryoDev/barakoCMS/pull/748) | 6 | Files-module documentation corrections | Merged |
| [Fair-Code #630](https://github.com/yakew7/Fair-Code/pull/630) | 47 | Rejecting invalid benchmark iteration counts | Merged |
| [driftcheck #47](https://github.com/yunaremaia/driftcheck/pull/47) | 3 | Detector reference tables | Merged |
| [Sotto #277](https://github.com/getsotto/sotto/pull/277) | 31 | Guide navigation derived from shared metadata | Merged |
| [pyMOR #2631](https://github.com/pymor/pymor/pull/2631) | 347 | NumPy shape-assignment compatibility | Awaiting review |
| [MiniSearch #2671](https://github.com/felladrin/MiniSearch/pull/2671) | 589 | Settings-listener cleanup and regression tests | Merged |
| [MiniSearch #2686](https://github.com/felladrin/MiniSearch/pull/2686) | 589 | Separate ranking metrics by search type | Merged |
| [MiniSearch #2698](https://github.com/felladrin/MiniSearch/pull/2698) | 589 | Production passage ranking and correct score-to-item mapping | Merged |
| [django-ox #67](https://github.com/oxpull/django-ox/pull/67) | 111 | Clear errors for unknown worker backends | Merged |

One locally prepared httptap fix was superseded by another contributor before publication. It is excluded from the submitted and merged totals. Useful work includes recognising when a problem has already been solved.

## What I’ll share next

The next articles will examine selected contributions in more detail: the problem, the decisions, the role of AI, the evidence and what maintainers changed. The shorter contribution record will cover the rest.

I’d like Open Source Everyday to grow into a community after the first month. For now, I’m documenting a process that other developers can inspect and try. If you maintain a project, what evidence would help you review an AI-assisted contribution more confidently?
