# Open Source Everyday: testing the behaviour behind the fix

By Emmanuel Tagbor · Weekly notes, 21–27 September 2026 · Status checked 28 September

This week’s contributions took us through browser coordinates, model catalogs, Python packaging and terminal behaviour. The recurring question was whether our checks exercised the behaviour someone would actually depend on.

Six new pull requests went out across six projects. Three contributions merged during the week. Four of the six new PRs remain open. The details below separate those outcomes because submitting a patch and having it accepted are different stages of the work.

My setup is still Codex with Astra. Codex helps investigate repositories, implement changes, run validation and review the result. I select the work, make scope decisions and review the results. Maintainers decide what belongs in their projects and often improve the final patch. Repository-specific rules still determine when human review or human-written descriptions are required.

## Following a bug all the way to the browser

In [PHP WebDriver #1157](https://github.com/php-webdriver/php-webdriver/pull/1157), a point could fail an equality comparison with itself.

The class stored coordinates from the browser, which can contain fractions. Its public `getX()` and `getY()` methods returned integers. The old `equals()` method compared one point’s raw stored values with the other point’s integer getters. The two sides were using different representations of the same coordinates.

The proposed fix compares both points through their public getters. It preserves the existing integer-coordinate contract rather than changing how callers read positions.

Codex first ran the new regression tests against the unchanged implementation. Both failed. With the fix, they passed, covering self-comparison, symmetry, negative fractions and movement.

Then came the browser check. A disposable Docker container ran Selenium and Firefox, alongside a local PHP fixture server. Firefox returned coordinates of `33.5, 550.75`. The point exposed `33, 550` through its getters and correctly compared equal to itself.

That extra step connected the unit test to a real WebDriver response. The local browser test class passed 26 tests with 86 assertions. The broader browserless run had 183 functional skips, so it would have been misleading to present that run alone as browser validation. Hosted checks also passed across the repository’s PHP and browser matrix. The PR remains open for maintainer review.

## Refreshing a catalog without damaging existing choices

[HostedGPT #806](https://github.com/AllYourBot/hostedgpt/pull/806) added a `models:refresh` Rake task backed by RubyLLM’s registry. It merged on 26 September.

The important boundary was deciding which configured services should receive which models. Two services can accept the same API request format while offering different model catalogs. Importing OpenAI’s catalog into every OpenAI-compatible endpoint would make the interface list models that the service might not provide.

The merged importer checks both provider identity and the canonical service URL. Custom endpoints are excluded. Existing names and capability settings, soft-deleted rows and assistant model links are preserved. Repeating the task does not add duplicate rows.

Missing catalogs also have an explicit outcome. The RubyLLM version used here has no Groq catalog, so that path prints a warning. It does not invent a catalog from another provider.

Codex ran the final affected tests: 47 tests and 266 assertions passed. Hosted Rails checks and three Docker builds also passed. That establishes test and build evidence, not a production refresh or deployment.

The maintainer suggested considering periodic refresh and replacing the older import/export flow later. Those are follow-up ideas. They are not features shipped in this PR.

## Checking whether a performance change earns its complexity

The open [fd buffering proposal, #2142](https://github.com/sharkdp/fd/pull/2142), gave us a different kind of result.

A local fixture showed fewer stdout writes, from a median of 1,561 to 332. But elapsed-time measurements did not establish a meaningful speedup. In a separate sparse-output probe, delivery changed from about 4.5 ms to 106 ms.

Those measurements come from different workloads and cannot be combined into a universal cost-benefit ratio. They do show why counting fewer writes is insufficient evidence that the change helps users.

The current proposal remains open. Its useful benefit has not been established, and I’m not presenting it as a performance win. Any further experiment needs a concrete workload and an acceptable latency budget before more design work makes sense.

This has become a useful review question: what result would justify the extra behaviour or complexity, and did we measure that result?

## Two more contributions reached merge

The [pyMOR compatibility change](https://github.com/pymor/pymor/pull/2631) merged on 24 September after maintainer review. Replacing deprecated NumPy shape assignment required preserving write-protection behaviour. Making a view read-only does not remove write access through another reference to the original array. The final patch preserves the relevant protection and reflects the maintainer’s requested scope changes. Local regression experiments supported the review, but no new tests were included in the final merged diff.

In [django-ox #76](https://github.com/oxpull/django-ox/pull/76), the work concerned GitHub Actions security checks. Our contribution addressed the issue’s workflow findings and added checksum-pinned zizmor scanning to CI. PhiLily then strengthened suppression handling and added a separate online Security job. The required offline scanner and the online checks serve different purposes: online results can depend on changing advisories and API availability. That separation and its reasoning belong to PhiLily. All 34 hosted checks passed on the final head before merge.

Maintainer changes are part of the final contribution story. We reconcile the merged diff with the original patch and carry useful corrections into the review checklist.

## The weekly record

Repository stars were checked on 28 September 2026. They describe interest in a project, not the value or reach of our individual contribution.

| Contribution | Stars | Work and current status |
|---|---:|---|
| [django-ox #76](https://github.com/oxpull/django-ox/pull/76) | 117 | Submitted 21 Sep; workflow security checks, merged 23 Sep |
| [fd #2142](https://github.com/sharkdp/fd/pull/2142) | 44,569 | Submitted 23 Sep; buffering proposal, open with benefit questions unresolved |
| [check-manifest #182](https://github.com/mgedmin/check-manifest/pull/182) | 293 | Submitted 24 Sep; prefer the available Breezy `brz` command with legacy `bzr` fallback, open |
| [PHP WebDriver #1157](https://github.com/php-webdriver/php-webdriver/pull/1157) | 5,196 | Submitted 26 Sep; point equality, open |
| [HostedGPT #806](https://github.com/AllYourBot/hostedgpt/pull/806) | 511 | Submitted and merged 26 Sep; provider-aware model refresh |
| [terminal-size #85](https://github.com/eminence/terminal-size/pull/85) | 119 | Submitted 27 Sep; controlling-terminal fallback, open |
| [pyMOR #2631](https://github.com/pymor/pymor/pull/2631) | 347 | Submitted 16 Sep; NumPy compatibility, merged 24 Sep |

The terminal-size contribution also exercised a real operating-system boundary. Local macOS pseudo-terminal checks distinguished standard input, output, error and the controlling terminal. Hosted checks were still awaiting maintainer approval at this review, so those local results are not a claim of completed Linux, Windows or minimum-supported-Rust validation.

## Keeping the practice useful

The contribution process now keeps the reproduction, affected user path, test results and remaining limits together with the reviewed patch. That makes a later maintainer response easier to evaluate without reconstructing the whole investigation.

I still estimate roughly one to two hours across scouting, implementation, review and follow-up for a contribution. That is a personal estimate, not a measured weekly average. This week also included waiting for reviews and revisiting assumptions after submission.

For the next week, I want to keep that distinction visible: work can be well tested and still need a better reason to exist. Useful contributions include fixes that merge, careful follow-up, and decisions to stop defending an approach when its benefit is unproven.

[Read the opening Open Source Everyday article](https://www.kemmatechnologies.com/blog/two-weeks-of-open-source-everyday).
