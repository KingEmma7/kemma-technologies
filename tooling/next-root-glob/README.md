# Next.js lint root-directory adapter

The website retains the complete Next.js core-web-vitals, React, React Hooks and
TypeScript ESLint configurations. A version-scoped npm override replaces only
the `fast-glob` dependency of `@next/eslint-plugin-next@16.3.8` with this private
local npm workspace. Its package name is the dependency's import name, `fast-glob`,
with an explicit private version `3.3.1-kemma.1`; it contains our adapter, not
upstream fast-glob code. A root dev dependency and npm's `$fast-glob` reference
make clean installs reproducible without relative paths inside node_modules.
It removes `micromatch` and vulnerable `braces` from the installed
dependency tree; it does not waive an audit finding or change CI's audit policy.

The pinned plugin uses one API, `globSync(string, { onlyDirectories: true })`,
in its root-directory utility for `no-html-link-for-pages`. This adapter uses
maintained `tinyglobby`, disables its default recursive directory expansion,
handles literal roots directly, preserves absolute input paths, and removes
directory-result trailing slashes.
Unsupported calls fail explicitly instead of silently returning incomplete roots.
There is no postinstall patch, fork of the Next rules, or published private package.
The CommonJS entry is required by Next's existing synchronous `require` call.
Its import-style rule permits only `node:fs`, `node:path` and `tinyglobby` in this
new adapter file; the rule stays an error and all other lint rules remain enabled.

The existing website has no custom `settings.next.rootDir`; its default root and
lint behavior are unchanged. Literal, absolute, wildcard, brace, extglob,
nonexistent, and array-of-root settings are regression-tested, together with real
internal-link violations and all pre-change rule fingerprints.

Documented differences for custom root settings: matching order can differ;
relative `./` and trailing separators are normalized (they resolve to the same
directories). A terminal `**` includes its base directory under tinyglobby,
where fast-glob omits it. This deliberately checks an additional candidate root
rather than dropping any matching root; it can report additional internal links
if that base directory itself contains an app/pages tree. No such custom setting
exists here. General fast-glob APIs/options are intentionally unsupported.

An existing upstream Next rule limitation was observed before the adapter:
some nested App Router URLs are not reported because its generated URL regex
and normalized href differ in trailing-slash handling. The homepage and Pages
Router violations used in our regression tests are reported correctly. This
adapter does not modify Next's URL handling or claim to fix that separate issue.

When updating Next ESLint, inspect its dependency/API use, update the scoped
override and regression tests deliberately, and keep the full audit passing.
Remove this adapter once an upstream release eliminates the vulnerable chain.

References: [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides),
[tinyglobby migration](https://superchupu.dev/tinyglobby/migration),
[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
