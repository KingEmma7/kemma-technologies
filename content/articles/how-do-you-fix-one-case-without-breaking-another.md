# How do you fix one case without breaking another?

Open Source Everyday · Week 5 · 5–11 October 2026

A fix usually starts with one example that fails. This week, the harder question was what should continue to work after that example passes.

One contribution taught a scanner to recognise a missed header. Another handled a command’s output closing early. A third added tests for a command that checks generated files. Each needed a different kind of evidence that the change preserved the surrounding behaviour.

As of 12 October, this practice has produced **32 submitted pull requests and 25 merged**. Six remain open and one was closed without merging. These are cumulative totals, not the number of contributions completed during Week 5.

AI is a big part of my workflow, from investigating issues to implementation and testing. I choose contributions, make scope decisions and review the results. Maintainer findings are credited separately below.

## A scanner warning needs the right context

**mcp-migrate · [PR #335](https://github.com/dheerajjha/mcp-migrate/pull/335) · merged 11 October · 12 repository stars, checked 12 October**

mcp-migrate checks source code for changes needed when adopting a newer Model Context Protocol specification. MCP is the protocol tools use to communicate with AI applications.

The maintainer reported that the Python scanner missed a `Last-Event-ID` header read when the result was stored in a variable named `cursor`. Changing the variable’s name could make the warning appear. The header itself should have been enough to detect that case in MCP code.

The initial implementation passed its planned 1,023-test suite. Then validation replayed the scanner against real projects pinned to specific commits.

That replay found a problem: a project’s grade changed from A/97 to C/72 because its browser chat route also used `Last-Event-ID`. That header lets a browser resume an event stream; its presence did not make the route an MCP transport. The proposed fix had found the header but misunderstood where it belonged.

The revision required an independent MCP signal in the same file before reporting the new header finding. An MCP server elsewhere in the project was insufficient. A synthetic regression captured the browser case, and the final replay reproduced all 20 published board entries without changing their grades.

The final contribution passed 1,029 tests on each of Python 3.10–3.13 and 29 real command-line checks. The maintainer independently confirmed the behaviour and approved the final revision.

This remains a file-level text check, not a complete analysis of every endpoint. The result supports the tested boundary; it does not promise that every false positive is gone.

**The review habit:** test a valid example that resembles the bug. When broadening detection, ask which nearby cases must remain silent.

## Handling an output failure must preserve the original error

**vibewatt · [PR #136](https://github.com/MMALI3287/vibewatt/pull/136) · merged 10 October · 0 repository stars, checked 12 October**

Command-line tools can send their output to another program. If that program stops reading early, the writer may encounter a closed pipe. The original issue asked vibewatt to handle that situation quietly instead of printing a traceback.

The first fix handled the output failure, but the maintainer found an interaction the separate tests had missed. A command could already have failed, then fail again while printing its error. The new handler changed the original exit status from 2 to 1.

An exit status is the number a command returns to its caller. Scripts can use it to decide what happened. Replacing it with a different failure status loses information about the command’s first error.

The revision preserved an already established error status. Twelve new regression cases combined three command errors with two buffering modes and two entry points. All twelve failed against the first revision and passed after the correction.

Windows supplied another boundary. Actual CI raised `EINVAL` in cases where the first fix expected `BrokenPipeError`. The revision recognises that alternative only on Windows and only when the output descriptor is confirmed to be a pipe. Other output errors remain visible. Final hosted checks passed on Windows, Linux, macOS and the additional Python versions.

**The review habit:** test the original failure together with a failure in reporting or cleanup. Check what the caller ultimately receives, and keep exception handling narrow enough to preserve unrelated errors.

## A check command must leave files alone

**Guardana · [PR #58](https://github.com/guardana/guardana/pull/58) · merged 8 October · 272 repository stars, checked 12 October**

Guardana’s sitemap generator has a check mode that reports missing or stale output. This contribution added coverage for that existing behaviour; it did not fix a demonstrated production defect or change the generator.

Checking the return status alone would leave a gap. A command could detect stale output correctly and still rewrite the files while checking them.

The tests compared file contents, modification times and directory membership before and after check mode. Missing outputs had to stay missing. Stale outputs had to stay untouched. The normal write mode still had to generate the expected output, and a fresh check then had to succeed.

Nine deliberately incorrect variants were tested in disposable copies. Each made the new tests fail. That showed the tests could detect the wrong behaviours they were intended to guard against. The maintainer also confirmed the expected ordering of the generated URLs.

**The review habit:** include side effects in the contract. For a read-only operation, check what it leaves behind as well as what it returns.

## What I’m carrying into the next contribution

These examples give me three concrete questions for the review checklist:

- Which valid case looks similar to the bug and must keep working?
- What happens if another operation fails at the same time?
- What should the command leave unchanged after it runs?

The answers determine the checks. A detection change needs positive and negative examples, plus relevant real-project replay. Error handling needs combined failures and actual platform evidence. A read-only command needs filesystem checks.

The TypeScript follow-up to mcp-migrate, [PR #338](https://github.com/dheerajjha/mcp-migrate/pull/338), merged on 12 October, after this recap’s week. Review of that follow-up exposed a missing MCP-header signal in the shared check and led to another correction. It is included in the dated cumulative totals above, rather than counted as a Week 5 merge.

For the next contribution, I want the review to establish both the case the change fixes and the behaviour it needs to preserve.
