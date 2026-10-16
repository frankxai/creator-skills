# creator-skills — repo conventions

Public skills catalog. Everything here ships to strangers' machines via `npx skills add frankxai/creator-skills`.

## Architecture Stack (canonical)

Before recommending or choosing technology, hosting, AI gateways, agent runtimes, databases, or storage:

1. Fetch and follow the living document:  
   https://github.com/frankxai/frankx-starlight-command/blob/main/ARCHITECTURE-STACK.md
2. Use the Architectural Checker prompt inside that file for any new surface.
3. Record repo-specific exceptions as short ADRs and link them back to the canonical file.
4. Do not invent a parallel stack doctrine in this repo.

## Layout

- `skills/<category>/<name>/SKILL.md` — one skill per folder. Categories: video, music, images, brand.
- Supporting files live beside the SKILL.md (`references/`, `*.json`). No nested skill directories.

## Skill rules

- Frontmatter keys: `name` (kebab-case, must equal the folder name), `description` (the trigger surface, max 1024 chars), optional `version`, `argument-hint`, `allowed-tools`. Nothing else.
- The description says WHEN to fire, not what the file contains.
- Bodies are portable: no personal paths, no machine-specific setup, no references to private repos or internal systems.
- Engines are referenced, never vendored: skills shipped by vendors (Higgsfield CLI skills, HyperFrames skills) are prerequisites the router dispatches to — do not copy third-party SKILL.md files into this repo.
- Paid services are named in the skill's first section; env-var patterns only, never literal credentials. Affiliate relationships are disclosed where relevant.

## Gates — run before any commit

- `node scripts/validate-skills.mjs` must pass (frontmatter schema + banned-pattern scan).
- New skill → add its Catalog row in README.md.

## Never

- No secrets, no user paths, no client or employer specifics.
- No emoji in skill bodies or the README.
- This repo is the source of truth; local runtimes consume it via `scripts/sync-to-local.ps1`, never the reverse.
