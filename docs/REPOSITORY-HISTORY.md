# Repository history

**Biotech Knowledge Services' Git history starts at a clean-slate root commit (November 2026).** The owner moved the
repository from the `Overton77` GitHub account to `jbell-rusty-vantage` and chose a fresh start over carrying the old
history: start-up mode, forward only.

## The baseline

- The root commit has no parent. Its tree is the pre-move `sprint-oc` working tree (tip `a70c3c6`, the 2026-11-07
  environment-name change) plus the pre-publication documentation and configuration audit of 2026-11-07.
- The repository is [`jbell-rusty-vantage/biotech-knowledge-services`](https://github.com/jbell-rusty-vantage/biotech-knowledge-services),
  which is public. Only `main` is published.
- The old `Overton77/biotech-knowledge-services` repository is legacy and no longer the source of truth. Do not push to
  it or open pull requests there.

## Commit IDs and links in older documents

Dated records (`docs/plans/schema-v2-service-release/`, `schema/program/`, benchmark and evidence files, release
reports) cite commit IDs and links to the old repositories (`Overton77/...`). **Those commits do not exist here**, and
the old links are not public.

- Read an old ID as a dated label for the state of the code at that time, not something to check out or diff against.
- Claims stand or fall on current code and tests; re-verify against live source before relying on one.
- Do not rewrite old documents only to remove IDs; they remain provenance. The pinned schema bundle
  (`schema/pinned/**`) and authored release sources are byte-verified and are never edited by hand, even where their
  provenance text names an old repository.
- Cite the baseline or later commits in new documents.

## Going forward

- Work lands on `main`; publish only `main` unless the owner asks otherwise.
- Keep the secret scan clean (`gitleaks detect --no-git --source . --redact`): fixtures use obviously fake values, and
  real credentials, `.scratch/`, `runs/` and custody evidence never enter tracked files.
- Windows clones may need `git config core.longpaths true`.
