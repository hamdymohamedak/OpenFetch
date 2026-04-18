# Examples

Everything in this folder illustrates **how to use or extend** the library and its tooling.

| Path | Purpose |
|------|--------|
| [`rsc-page.example.tsx`](./rsc-page.example.tsx) | Sample **React Server Component** using `@hamdymohamedak/openfetch`. |
| [`claude-skill/`](./claude-skill/README.md) | **Claude Code** plugin layout: how to structure `SKILL.md`, `plugin.json`, and `references/`. Copy this tree when authoring a new skill. |

## Where the real pieces live

- **Published Claude plugin** (separate repo): [openfetch-js/openFetchSkill — README](https://github.com/openfetch-js/openFetchSkill/blob/main/README.md) — contains `skills/openfetch/SKILL.md` for agents.
- **Library source & package** (this repo): **root** — [`package.json`](https://github.com/openfetch-js/OpenFetch/blob/main/package.json), [`src/`](https://github.com/openfetch-js/OpenFetch/tree/main/src), [`README.md`](https://github.com/openfetch-js/OpenFetch/blob/main/README.md).

The template under `claude-skill/` is **not** wired into [`.claude-plugin/marketplace.json`](https://github.com/openfetch-js/OpenFetch/blob/main/.claude-plugin/marketplace.json); only `openfetchskill` in this monorepo is.
