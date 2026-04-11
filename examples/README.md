# Examples

Everything in this folder illustrates **how to use or extend** the library and its tooling.

| Path | Purpose |
|------|--------|
| [`rsc-page.example.tsx`](./rsc-page.example.tsx) | Sample **React Server Component** using `@hamdymohamedak/openfetch`. |
| [`claude-skill/`](./claude-skill/README.md) | **Claude Code** plugin layout: how to structure `SKILL.md`, `plugin.json`, and `references/`. Copy this tree when authoring a new skill. |

## Where the real pieces live

- **Published Claude plugin** (marketplace): [`../openfetchskill/`](../openfetchskill/README.md) — contains `skills/openfetch/SKILL.md` for agents.
- **Library source & package** (the product the skill describes): **repo root** — [`package.json`](../package.json), [`src/`](../src/), [`README.md`](../README.md).

The template under `claude-skill/` is **not** wired into [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json); only `openfetchskill` is.
