# Creator Skills — creative production, from Agentic Creator OS

[![skills.sh](https://skills.sh/b/frankxai/creator-skills)](https://www.skills.sh/frankxai/creator-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

You subscribed to five AI tools and still can't ship a video a day. The missing piece is routing, not another model.

```sh
npx skills add frankxai/creator-skills
```

One command, ~30 seconds. Works with Claude Code, Cursor, Gemini CLI, Windsurf, and Codex. Creative-production skills — video routing, music, image generation, brand voice — not marketing-ops.

## Catalog

| Skill | Category | Fires when |
|---|---|---|
| [video-gen](skills/video/video-gen/SKILL.md) | video | any image/video request — classifies intent, dispatches engines, chains assembly and editing |
| [video-engine-routing](skills/video/video-engine-routing/SKILL.md) | video | cost, volume, or capability forces an engine decision: subscription vs pay-per-use vs cloud ComfyUI |
| [suno-prompt-architect](skills/music/suno-prompt-architect/SKILL.md) | music | writing Suno prompts that need commercial quality |
| [suno-ai-mastery](skills/music/suno-ai-mastery/SKILL.md) | music | advanced Suno composition: genre systems, structure, vocals |
| [acos-visual-gen](skills/images/acos-visual-gen/SKILL.md) | images | research-grounded infographics and educational visuals |
| [arcanea-book-cover](skills/images/arcanea-book-cover/SKILL.md) | images | book covers designed from tension, emotion, and genre |
| [brand-voice](skills/brand/brand-voice/SKILL.md) | brand | writing or reviewing anything that must sound like YOUR brand |

## How the video lane works

`video-gen` is a router: it classifies the request (deliverable × identity-consistency ×
destination) and dispatches to whichever engines you have installed — Higgsfield CLI skills
for generation, Nano Banana for reference edits, HyperFrames for HTML compositions and
captions, Descript for text-based editing. Those engine skills ship from their vendors;
this repo deliberately does not republish them. Install the engines you pay for, and the
router uses what it finds.

`video-engine-routing` is the escalation path: the current pricing table and the graduation
triggers for moving between subscription credits, pay-per-use APIs (fal.ai), and cloud
ComfyUI — including the rule that integrated-GPU machines never render video locally.

## Field notes

Long-form walkthroughs of these pipelines, from the site:

- [The Ultimate Higgsfield Workflow (2026)](https://www.frankx.ai/blog/ultimate-higgsfield-workflow-2026)
- [The Research → Generation Flywheel](https://www.frankx.ai/blog/the-research-generation-flywheel-sandcastles-higgsfield-grok-2026)
- [Faceless YouTube: ElevenLabs narration + Higgsfield b-roll](https://www.frankx.ai/blog/using-elevenlabs-for-faceless-youtube-channels-and-higgsfield-for-b-roll)

These skills ship inside [Agentic Creator OS](https://github.com/frankxai/agentic-creator-os),
the full creator operating system. Disclosure: I'm a Higgsfield Ambassador; Higgsfield links
on frankx.ai may be affiliate links. The routing logic here sends you elsewhere whenever
elsewhere genuinely wins.

## Related lanes

- [frankxai/skills](https://github.com/frankxai/skills) — the architect lane: MCP, orchestration, model routing, context engineering.
- [agentic-creator-os](https://github.com/frankxai/agentic-creator-os) — the full creator operating system these skills ship inside.
- [claude-skills-library](https://github.com/frankxai/claude-skills-library) — the full 100+ skill catalog.

## Newsletter

One new skill every week, with the problem it solves. [Subscribe →](https://www.frankx.ai/newsletter?utm_source=github&utm_medium=readme&utm_campaign=creator-skills)

## License

MIT — see [LICENSE](LICENSE).
