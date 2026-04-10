# openfetch — agent skill (paths)

The **canonical** skill files for Claude Code live under the plugin bundle (required so the plugin cache can copy all assets):

- **`plugins/openfetch/skills/openfetch/SKILL.md`**
- **`plugins/openfetch/skills/openfetch/references/quick-reference.md`**

## Claude Code marketplace

This repo includes **`.claude-plugin/marketplace.json`**. After cloning/pulling from GitHub:

```text
/plugin marketplace add openfetch-js/OpenFetch
```

(or `hamdymohamedak/OpenFetch` if you use that fork)

Then install the plugin:

```text
/plugin install openfetch@openfetch-js
```

CLI equivalents (see [Claude Code plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)):

```bash
claude plugin marketplace add openfetch-js/OpenFetch
claude plugin install openfetch@openfetch-js
```

## skills.sh / other CLIs

Tools that expect `SKILL.md` at a fixed path may need the path `plugins/openfetch/skills/openfetch/` or a copy of that folder; check your tool’s docs.
