# ACOS skill pack (Agentic Creator OS)

**Repo:** `frankxai/creator-skills` (this tree)  
**Not an awesome-* catalog.** Public listed unit for ACOS creative production.

```sh
npx skills add frankxai/creator-skills
```

Already on skills.sh: https://www.skills.sh/frankxai/creator-skills

## Include (all 8)

| Skill | Lane |
| --- | --- |
| `production-review` | reviews (user-invoked) |
| `video-gen` | video router |
| `video-engine-routing` | cost/engine |
| `suno-prompt-architect` | music |
| `suno-ai-mastery` | music |
| `acos-visual-gen` | images |
| `arcanea-book-cover` | images (genre covers; not the Arcanea world pack) |
| `brand-voice` | brand |

## Exclude

- `agentic-creator-os` (full OS, 100+ skills — not a pack)
- `agentic-creator-skills` (marketplace dump + third-party ports)
- Vendor engine SKILL.md (Higgsfield, HyperFrames) — reference, do not vendor

## MCP pair

`starlight-creator-mcp` when published. Until then: skills route; humans/keys run engines.

## Maintain

`node scripts/validate-skills.mjs` before commit. Repo is SSOT; runtimes consume via sync, never the reverse. Weekly: one skill improved from a real production miss.
