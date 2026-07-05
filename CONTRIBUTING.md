# Contributing

Creator skills route real production work — video, music, images, brand. PRs that add or sharpen one are welcome.

## Add a skill

1. Create `skills/<category>/<name>/SKILL.md`. Categories: `video`, `music`, `images`, `brand`. New category? Say why in the PR.
2. Frontmatter — these keys only:
   ```
   ---
   name: <kebab-case, must equal the folder name>
   description: <when this fires — the trigger surface, max 1024 chars>
   version: 1.0.0   # optional
   ---
   ```
   The description tells the model *when* to fire, not what the file contains.
3. Body is portable: no personal paths, no machine-specific setup, no secrets, no private-repo references.
4. **Reference engines, don't vendor them.** Vendor-shipped skills (Higgsfield CLI skills, HyperFrames skills) are prerequisites the routers dispatch to — don't copy third-party `SKILL.md` files in here. Name any paid service in the skill's first section; disclose affiliate ties.
5. Add a Catalog row in `README.md`.

## Before you open the PR

```sh
node scripts/validate-skills.mjs
```

Checks the frontmatter schema and scans for personal paths and secrets. CI runs the same on every push — green or it doesn't merge.

## What gets merged

Skills that encode real production judgment: a routing decision, a prompt system, a pipeline — not a generic tutorial. Small and composable beats broad and vague.

MIT-licensed, like the rest of the repo. By contributing you agree your work ships under it.
