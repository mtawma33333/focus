# Docs

Only the documentation needed to understand and maintain this repository. These files hold the stable contract and boundaries; implementation mechanics live in the code.

## Files

- `architecture.md` — module boundaries, cross-package invariants, data flow
- `contract.md` — database schema, API surface, external behavior
- `adr/` — the accepted decisions that are hard to reverse and surprising without context

## Reading order

- `architecture.md` first, for where code lives and how the layers connect
- `contract.md` next, for the behavior each layer must preserve

## Rule of thumb

If a detail changes whenever one file changes, read that file instead of the docs.
