/* eslint @typescript-eslint/no-require-imports: ["error", { "allow": ["^node:(fs|path)$", "^tinyglobby$"] }] */
const { statSync } = require("node:fs");
const { isAbsolute, normalize } = require("node:path");
const { globSync: tinyGlobSync, isDynamicPattern } = require("tinyglobby");

// This is deliberately not a general replacement for the fast-glob API.
// Next 16.3.8 uses only globSync(string, { onlyDirectories: true }).
function globSync(pattern, options) {
  if (
    typeof pattern !== "string" ||
    options?.onlyDirectories !== true ||
    Object.keys(options).some((key) => key !== "onlyDirectories")
  ) {
    throw new TypeError("Next root glob adapter only supports directory root patterns");
  }

  // Preserve literal directory roots, including / (which tinyglobby treats as cwd).
  if (!isDynamicPattern(pattern)) {
    return statSync(pattern, { throwIfNoEntry: false })?.isDirectory()
      ? [normalize(pattern).replace(/\/$/, "") || "/"]
      : [];
  }

  return tinyGlobSync(pattern, {
    onlyDirectories: true,
    expandDirectories: false,
    absolute: isAbsolute(pattern),
  }).map((directory) =>
    directory !== "/" ? directory.replace(/\/$/, "") : directory,
  );
}

module.exports = { globSync };
