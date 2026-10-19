# Six weeks of open-source contribution: 38 PRs, 31 merged

Open Source Everyday · 7 September–18 October 2026 · Outcomes checked 19 October

I started Open Source Everyday on 7 September to make contributing to open source a regular part of my work. The first pull request went out two days later, fixing a JavaScript scanner that skipped several kinds of scripts.

Over the six weeks, the work grew to **38 submitted pull requests across 29 repositories**. As of 19 October, **31 have merged: an 81.6% merge rate**. The contributions span Python, TypeScript, JavaScript, Rust, Ruby, PHP and Wave.

The work has included command-line bugs, search metrics, scientific Python, language features, documentation, automated tests and interface behavior. Some contributions merged quickly. Others needed revisions or weeks of follow-up.

AI is a big part of my workflow, from investigation to implementation and testing. I choose the work, make scope decisions and review the results. Maintainers bring their own knowledge of the project, review the changes and decide what to merge.

## The six weeks in numbers

| Measure | As of 19 October |
| --- | ---: |
| Pull requests submitted | 38 |
| Merged | 31 |
| Still open | 6 |
| Closed without merging | 1 |
| Repositories | 29 |
| Repositories with merged contributions | 22 |
| Programming languages | 7 |

The submission period covers 42 calendar days, from 7 September to 18 October. PRs were submitted on 32 different dates. The other days included scouting, testing, revisions and follow-up.

| Submission week | Dates | PRs |
| --- | --- | ---: |
| Week 1 | 7–13 September | 5 |
| Week 2 | 14–20 September | 7 |
| Week 3 | 21–27 September | 6 |
| Week 4 | 28 September–4 October | 7 |
| Week 5 | 5–11 October | 7 |
| Week 6 | 12–18 October | 6 |

## The first weeks established the routine

The first contribution, [Skill-audit #18](https://github.com/AgentPostmortem/Skill-audit/pull/18), added four missing script extensions to a scanner. The source change was small, but the checks followed the files through the actual command and its output. A script in a nested directory needed to appear under the correct path, just like one at the root.

That first week also included Python test coverage, benchmark input validation and C# project documentation. The routine already involved reading contribution rules, reproducing a problem, keeping the change focused and checking the result through the tool people use.

In the second week, I contributed to several MiniSearch issues. One, [#2671](https://github.com/felladrin/MiniSearch/pull/2671), cleaned up a settings subscription after a user granted permission to download a model. The tests used the actual permission component and settings channel. The maintainer independently restored the missing-cleanup bug and confirmed that two tests failed.

Another, [#2686](https://github.com/felladrin/MiniSearch/pull/2686), separated text and image search metrics while keeping the combined totals correct. The test inputs made the calculation clear: text requests of 100 and 300 milliseconds, plus an image request of 20 milliseconds, give a combined average of 140 milliseconds. Averaging the two category averages would give the wrong answer.

These contributions gave me useful examples of what to look for in a test: a realistic user action, a specific expected result and a failure when the original mistake returns.

## September also brought compatibility and scope decisions

In [pyMOR #2631](https://github.com/pymor/pymor/pull/2631), replacing deprecated NumPy shape assignments required preserving how existing arrays were protected from writes. Local review caught a version that let a caller change data that should remain read-only. The fix preserved that protection.

The PR also stayed open while related upstream code changed. Maintainer review led to a revision against the new code before it merged on 24 September. Following the current project state became part of finishing the contribution.

The Ruby work in [HostedGPT #806](https://github.com/AllYourBot/hostedgpt/pull/806) brought a different decision. Refreshing available AI models needed to preserve records people had already configured. It also needed to distinguish providers that share a request format from providers that share a model catalog.

After an approved scope question, the maintainer confirmed the intended provider coverage. The resulting refresh adds missing models while preserving existing settings and assistant links. That conversation settled behavior that the code alone could not decide.

## Week four crossed into language features and scientific documentation

Two Wave contributions added [ASCII-insensitive string comparison](https://github.com/wavefnd/Wave/pull/840) and [reverse substring search](https://github.com/wavefnd/Wave/pull/841). Reverse search needed to return the last matching position: searching for `aba` in `ababa` should return 2. Real Wave programs checked the behavior with optimization both disabled and enabled.

In [NumPyro #2314](https://github.com/pyro-ppl/numpyro/pull/2314), the contribution explained how a matrix is arranged into a vector for a probability distribution. The documentation now shows how to arrange the matrix one column at a time and match that order to the calculation. A runnable comparison accompanies the mathematical explanation.

Documentation also needed complete scope. The first [FINOS CALM #3214](https://github.com/finos/architecture-as-code/pull/3214) patch fixed one tutorial even though the issue named three. Reviewer Matthew Bain caught the omission. The final change covered all three tutorials, with tests that ran the examples through the installed command-line tool. His review suggestions also improved the test errors.

Across these projects, the useful checks depended on the problem: actual programs for language features, numerical comparisons for scientific examples and executable commands for tutorials.

## The last two weeks tested the surrounding behavior

In [mcp-migrate #335](https://github.com/dheerajjha/mcp-migrate/pull/335), a scanner change passed its planned tests but flagged an ordinary browser chat route as a migration problem. Replaying the scanner against existing projects caught that before submission. The corrected version detected the reported header case and preserved all 20 existing board results.

This connected to the earlier work on precise test inputs. The scanner needed examples of the bug and nearby valid code that should keep working.

The most recent week included test isolation, copy-feedback state, checker errors, registry tests and scrolling behavior. In [GPUI Kit #3518](https://github.com/longbridge/gpui-kit/pull/3518), I reviewed the original patch and tests and tried the behavior in the story app. The fix made an overflowing tab bar respond to a vertical mouse wheel while allowing the page to continue scrolling at the edge.

Maintainer Jason Lee then moved the behavior into shared scrolling code and applied it to more components. Reading the final merged version keeps his expansion visible in the record of the work.

## Submission is one part of the cycle

Today's [Zenix #74 merge](https://github.com/sepandhaghighi/zenix/pull/74) is a useful example. The PR was submitted on 29 September and merged on 19 October, after a documentation revision and formal maintainer approval. It gives noise generation its own random-number generator so it leaves the calling application's shared NumPy state alone.

That merge brought the total from 30 to 31. Six PRs are still open, with different review and CI prerequisites.

One PR was closed under a repository's AI-contribution policy. The project added the documented ban after submission, and we missed the new policy during a later follow-up. We stopped work there and added policy checks to follow-up reviews as well as initial scouting.

## What I’m taking forward

The six weeks have given me a contribution cycle I can repeat: find a useful problem, check the project rules and competing work, understand the affected behavior, make a focused change, validate it and follow it through review.

The examples also give that review concrete questions. Can the tests catch the original mistake? Does a nearby valid case still work? Are existing data and settings preserved? Did the final merged version change the scope or add someone else's work?

I’m now turning this workflow into Upstream, an app intended to guide someone from finding a contribution through submission, feedback, merge tracking and collecting the lesson afterward.

For the next period, I’m continuing with new contributions and following up on the six open PRs. 
