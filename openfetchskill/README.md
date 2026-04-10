# openfetchskill — Claude Code plugin bundle

This folder is the **published plugin** for `@hamdymohamedak/openfetch`. Claude Code copies the whole directory into its plugin cache, so the skill and references must live **inside** this tree (not outside).

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

To change behavior, edit **`skills/openfetch/SKILL.md`** (and files under `references/`). Keep the frontmatter `name` aligned with the skill folder name when possible.

For a **blank template** of this layout, see the sibling folder **[`example/`](../example/)**.
