# What maintainers noticed that I missed

**By Emmanuel Tagbor · Open Source Everyday · Week 4 · 28 September–4 October 2026**  
*Progress recorded as of 4 October. The week may still change.*

One of my open-source contributions included a test that could pass even when the code selected the wrong backend. The test checked that a worker started. Both available backends had the same settings, so choosing the wrong one still looked like success.

The maintainer, PhiLily, strengthened it by giving the selected backend a distinct worker class and checking which alias reached the worker. Now the test could tell the difference.

Codex had helped implement and validate the contribution, and I had reviewed it before submission. That gap still made it through. It changed a question in my review process: could this test pass if the code made the wrong choice?

That question applies well beyond this project. If you’re testing which database, storage provider or account a system selects, the alternatives need to behave differently enough for a mistake to show up.

The [django-ox change](https://github.com/oxpull/django-ox/pull/67) merged in September. I have been looking back at it this week because a new maintainer review exposed another gap between a passing check and a complete fix.

## What does this test actually prove?

PhiLily’s [follow-up commit](https://github.com/oxpull/django-ox/commit/d06a172c1437189e580bc3fc929b9f8caba14475) also corrected a purported default-behaviour test that still had cached configuration. PhiLily made both corrections before the merge.

There is a useful counterexample from another September contribution. On the [MiniSearch permission fix](https://github.com/felladrin/MiniSearch/pull/2671), maintainer felladrin [reported removing `unsubscribe()` locally](https://github.com/felladrin/MiniSearch/pull/2671#issuecomment-5721770951). Two of three permission tests failed for the right reason. He also valued that the tests used the real settings subscription and permission component. His independent check confirmed that the tests could detect the original bug.

The next time I test a backend choice, I’ll make the options behave differently and try the wrong one. For cleanup code, I’ll remove the call in a local check where feasible and see whether the relevant test fails.

## Have I fixed everything I said I fixed?

This week’s [FINOS CALM contribution](https://github.com/finos/architecture-as-code/pull/3214) started with tutorial 08. Its control example used a schema address that did not resolve, and the configuration needed to match the schema when a reader ran the documented command. The first patch repaired that example and tested it through the real command-line validator.

The PR also said it would close [the issue](https://github.com/finos/architecture-as-code/issues/3203). Matthew Bain [pointed out in review](https://github.com/finos/architecture-as-code/pull/3214#pullrequestreview-5400270434) that the issue already named tutorials 09 and 14. He asked us to cover them or describe the PR as only part of the fix. He also requested clearer errors when a test could not find a tutorial section and a troubleshooting hint for the required `$id` field.

The revision covered all three tutorials. Its tests run the documented examples through the CLI and name missing blocks instead of failing with an unhelpful null error. Matthew approved the revision, and the PR merged on 3 October.

I missed the scope in the issue before submission. The review step I’ve added is to put every requested outcome beside the final diff and its test before using “Fixes” in a PR description.

## What belongs in this contribution?

The earlier [pyMOR compatibility PR](https://github.com/pymor/pymor/pull/2631) carried another lesson about review. Maintainer sdrave [asked us to remove the added tests](https://github.com/pymor/pymor/pull/2631#pullrequestreview-5288703169), align the change with an intervening refactor and remove a duplicate write-protection call.

The final public patch became smaller. Codex-assisted local validation remained available for checking the change. That review was specific to pyMOR’s current code and the scope of this fix. It does not mean tests should generally stay out of pull requests.

I’ll still validate the behaviour thoroughly, then check which parts of that work the project should maintain. In this case, the local evidence stayed and the submitted diff followed the maintainer’s direction.

Week 4 status as of 4 October: **seven pull requests submitted across five repositories, six merged**. Across the practice: **25 submitted, 20 merged and five open**.
