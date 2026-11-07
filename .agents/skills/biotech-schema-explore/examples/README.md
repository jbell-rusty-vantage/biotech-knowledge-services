# Executable examples

Each `*.example.json` is a sequence of `bks-schema` invocations with expectations. They run against the **packaged
workspace** (a clean build of the pinned release into a temporary directory), not an author's checkout:
`packages/schema-workspace/src/skill-examples.test.ts` builds the workspace and executes every step through the CLI entry
point (`main(argv)` of `bks-schema`), appending `--dir <workspace>`.

Format `bks-skill-example.v1`:

- `steps[].argv`: CLI arguments after `bks-schema`; `{EXAMPLES}` is replaced by this directory.
- `steps[].expect.exit`: exit code.
- `steps[].expect.stdoutIncludes`: substrings of stdout.
- `steps[].expect.json`: checks on the JSON stdout. `path` uses dots and `*` to collect over arrays; one of `equals`,
  `includes` (array contains / string contains), `notIncludes`, `exists`.

Positive: per-serving label content, registry-versus-paper estimate, podcast recommendation, product-to-source trace.
Negative: wrong pin, retired Mention, stale hosted result, source instructions masquerading as a rule.
