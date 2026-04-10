# Example — how to structure a Claude Code skill

This folder is a **minimal template**. It mirrors the layout used by **[`openfetchskill/`](../openfetchskill/)** for the real openFetch plugin. Copy and rename when you add a new skill.

## Directory tree

```text
your-plugin/                    # e.g. openfetchskill
├── .claude-plugin/
│   └── plugin.json             # required: name, description, version
├── skills/
│   └── your-skill-name/        # one folder per skill; name should match SKILL frontmatter
│       ├── SKILL.md            # required: YAML frontmatter + Markdown instructions
│       └── references/         # optional: extra .md the agent can open
│           └── notes.md
└── README.md                   # optional: human docs for the plugin
```

## SKILL.md frontmatter

Use YAML between `---` lines at the top of `SKILL.md`:

```yaml
---
name: your-skill-name
description: One precise sentence: when the agent must load this skill (routing).
---
```

- **`name`:** Usually matches the folder under `skills/` (e.g. `openfetch`).
- **`description`:** This is the **trigger text**. Be specific so the model loads the skill for the right tasks and not for everything.

## plugin.json (minimal)

```json
{
  "name": "your-plugin-id",
  "description": "Short summary of what this plugin adds.",
  "version": "1.0.0",
  "author": { "name": "You" }
}
```

Place it at **`your-plugin/.claude-plugin/plugin.json`**.

## Listing the plugin in a marketplace

In the repo root, **`.claude-plugin/marketplace.json`** references your plugin with a **relative** `source`:

```json
{
  "name": "your-marketplace-id",
  "owner": { "name": "Your Name" },
  "plugins": [
    {
      "name": "your-plugin-id",
      "source": "./your-plugin-folder",
      "description": "What users see in the catalog"
    }
  ]
}
```

`source` must start with `./` and point at the folder that contains **`.claude-plugin/plugin.json`** (e.g. `./openfetchskill`).

## This example’s files

| Path | Role |
|------|------|
| [`example/.claude-plugin/plugin.json`](./.claude-plugin/plugin.json) | Dummy manifest (do not publish as-is). |
| [`example/skills/sample-skill/SKILL.md`](./skills/sample-skill/SKILL.md) | Minimal `SKILL.md` you can copy. |

Do **not** add `example/` to `marketplace.json` unless you intend to ship a real plugin from it.

## References

- [Claude Code — plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- Real implementation: [`../openfetchskill/`](../openfetchskill/)
