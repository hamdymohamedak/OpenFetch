# openfetchskill — Claude Code plugin bundle

This folder is the **published plugin** for `@hamdymohamedak/openfetch`. Claude Code copies the whole directory into its plugin cache, so the skill and references must live **inside** this tree (not outside).

The **library** (types, runtime, `package.json`) is the **repository root** — [`package.json`](../package.json), [`src/`](../src/), [`README.md`](../README.md).

## Layout

```text
openfetchskill/
├── .claude-plugin/
│   └── plugin.json          # plugin manifest
├── skills/
│   └── openfetch/
│       ├── SKILL.md         # agent skill (YAML frontmatter + body)
│       └── references/      # optional deep docs
│           └── quick-reference.md
└── README.md
```

## Install (Claude Code)

```bash
claude plugin marketplace add openfetch-js/OpenFetch
claude plugin install openfetch@openfetch-js
```

Use `hamdymohamedak/OpenFetch` if that is your fork.

## Authoring

Edit **`skills/openfetch/SKILL.md`** (and `references/`). Keep frontmatter **`name`** aligned with the skill folder name.

## Structure reference (template)

To generate a **new** skill with the same folder pattern, copy from **[`examples/claude-skill/`](../examples/claude-skill/README.md)** (see also [`examples/README.md`](../examples/README.md)).
