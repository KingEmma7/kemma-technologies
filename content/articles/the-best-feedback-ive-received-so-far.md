# The best feedback I’ve received so far

Some of the most encouraging feedback on my open-source contributions has been very specific. Maintainers have explained what they checked, what gave them confidence, and what still needed fixing.

Several examples have stayed with me.

“That is the part most pull requests skip, so thank you for getting it right.”

In MiniSearch, the maintainer removed the `unsubscribe()` line from the fix and ran the tests again. Two of the three permission tests failed, for the expected reason.

The tests exercised the real permission component and its event system. They could detect the broken behaviour returning. Having someone independently undo the fix and confirm that was encouraging.

[MiniSearch feedback](https://github.com/felladrin/MiniSearch/pull/2671#issuecomment-5721770951)

“This is a really careful first contribution.”

For devReady, the change read a Ruby version from a Gemfile. A Gemfile can contain executable Ruby, so the implementation accepted a literal version declaration without running the file.

The maintainer also pointed to the cases the parser deliberately ignored: environment variables, file reads, engine options and preview versions. Those examples helped them trust the boundary around the change.

That feedback gives me a useful way to assess a small fix: can a reviewer see what it accepts, what it leaves alone, and why?

[devReady feedback](https://github.com/Evalogical-Inc/devReady/pull/13#issuecomment-6369441010)

“saying which checks you could not run is more useful than a green checklist”

The BarakoCMS review praised something less comfortable to put in a PR description: checks that had not been run.

The maintainer explained that this helped them go straight to the parts they needed to verify. They checked the documentation against the source and also found a versioning correction that needed resolving before approval. The PR was approved and merged after that review process.

I want to keep that whole sequence in the story. The praise came alongside a correction, and the correction improved what eventually merged.

[BarakoCMS feedback](https://github.com/BaryoDev/barakoCMS/pull/748#pullrequestreview-5189153929) · [Final approval](https://github.com/BaryoDev/barakoCMS/pull/748#pullrequestreview-5190321670)

“Thank you @KingEmma7, this is an excellent first contribution.”

For Toolism, the contribution simplified a particular JSON Schema pattern, `allOf: [X]`, when it was safe to do so. That safety condition mattered: nearby keywords, references and schema versions can change the meaning of a schema.

The maintainer ran an independent fuzz test: 400 generated schemas with tricky combinations. The rule rewrote 336, and their verification found no counterexamples. The maintainer also checked the slow corpus suite before merging.

[Toolism review](https://github.com/rakeshnitb23/toolism/pull/78#pullrequestreview-5631866719)

There was another encouraging moment after that merge. On 24 October, Toolism’s automated contributor leaderboard showed me tied for first, with 35 points from that first merged help-wanted contribution. The board had changed by 31 October, when I was tied for fourth. The ranking is a points-based snapshot; the maintainer’s detailed review is what explains the work behind it.

[Toolism contribution](https://github.com/rakeshnitb23/toolism/pull/78) · [Contributor leaderboard](https://github.com/rakeshnitb23/toolism/issues/104)

“This is a careful piece of work.”

For Reviewer, the change folded large untracked folders so a review page could stay usable. The maintainer tested a repository containing a 3,000-file folder and checked the boundary: files in 200-file folders remained listed individually, while 201-file folders were folded.

They also caught something the first version got wrong: the page counted each folded folder as a changed file. After the revision, their example showed 204 changed files and four folded folders representing 3,652 untracked files. The feedback made the summary match what a reader was actually looking at.

[Reviewer feedback](https://github.com/dheerajjha/reviewer/pull/118#pullrequestreview-5635271647) · [Approval](https://github.com/dheerajjha/reviewer/pull/118#pullrequestreview-5635950243)

“Thanks @KingEmma7, this covers everything in #89.”

For Toolbelt, the contribution added tests around a shared tool registry and the metadata built from it. The maintainer deliberately broke the registry and related metadata in 23 ways, from a duplicate slug to an invalid priority. They reported that every change was caught by a test, while the valid boundary value still passed.

That kind of review checks both sides of a boundary: whether a test catches a problem and whether it leaves a valid case alone.

[Toolbelt review](https://github.com/codercops/toolbelt/pull/176#pullrequestreview-5533110427)

“I especially like that the format is validated before any data is generated or the seed is set”

In csv-faker-generator, the change checked the output format before generating data or setting the seed. An invalid call would therefore not overwrite an existing file. The maintainer approved it after their local checks.

It was a useful reminder to follow an input all the way to its side effects. A validation error is safer when it happens before the program changes anything.

[csv-faker-generator review](https://github.com/manojkken/csv-faker-generator/pull/20#pullrequestreview-5612398303)

These contributions were developed with Codex assistance. The independent checks described above were reported by the maintainers in their feedback; I’m keeping that attribution clear.

For my next contribution, these are useful questions to bring into review: does the test fail when the bug returns? Are the boundaries clear? Does the PR description say exactly what was verified and what still needs checking?
