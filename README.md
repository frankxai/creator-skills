# Creator Skills — Creative Production Agent Skills & Plugin

[![skills.sh](https://skills.sh/b/frankxai/creator-skills)](https://www.skills.sh/frankxai/creator-skills)
[![Agent Plugins 1.0](https://img.shields.io/badge/Agent%20Plugins-1.0-blue.svg)](plugin.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

You subscribed to five AI tools and still can't ship a video a day. The missing piece is routing, not another model.

One portable skill pack. Zero vendor lock-in. Works across **Claude Code**, **OpenAI Codex**, **Grok Build**, **Google Antigravity**, **Cursor**, and **Gemini CLI**.

---

## Quick Install (All Runtimes)

### 1. Claude Code, Cursor & Universal CLI
```sh
npx skills add frankxai/creator-skills
```

### 2. OpenAI Codex (Agent Plugin)
```sh
codex plugin install frankxai/creator-skills
```
*Or copy directly:* `cp -r skills/* ~/.codex/skills/`

### 3. Grok Build (xAI)
```sh
npx skills add frankxai/creator-skills --dest ~/.grok/skills
```

### 4. Google Antigravity
```sh
cp -r skills/* ~/.gemini/antigravity/skills/
```

---

**Start here:** [`production-review`](skills/reviews/production-review/SKILL.md) — a user-invoked skill that grills your video plan (hook, destination, consistency, cost) before you spend a credit, then hands the winning brief to the router.

## Catalog

Two kinds of skills. **User-invoked** ones you run deliberately — a review you start. **Model-invoked** ones fire on their own when the work matches.

| Skill | Category | Invocation | Fires when |
| :--- | :--- | :--- | :--- |
| [production-review](skills/reviews/production-review/SKILL.md) | reviews | **user-invoked** | you ask to pressure-test a video/content plan before generating |
| [video-gen](skills/video/video-gen/SKILL.md) | video | model-invoked | any image/video request — classifies intent, dispatches engines, chains assembly and editing |
| [video-engine-routing](skills/video/video-engine-routing/SKILL.md) | video | model-invoked | cost, volume, or capability forces an engine decision: subscription vs pay-per-use vs cloud ComfyUI |
| [suno-prompt-architect](skills/music/suno-prompt-architect/SKILL.md) | music | model-invoked | writing Suno prompts that need commercial quality |
| [suno-ai-mastery](skills/music/suno-ai-mastery/SKILL.md) | music | model-invoked | advanced Suno composition: genre systems, structure, vocals |
| [acos-visual-gen](skills/images/acos-visual-gen/SKILL.md) | images | model-invoked | research-grounded infographics and educational visuals |
| [arcanea-book-cover](skills/images/arcanea-book-cover/SKILL.md) | images | model-invoked | book covers designed from tension, emotion, and genre |
| [brand-voice](skills/brand/brand-voice/SKILL.md) | brand | model-invoked | writing or reviewing anything that must sound like YOUR brand |

---

## How the Video & Creative Pipeline Works

- `video-gen` is a universal router: it classifies the request (deliverable × identity-consistency × destination) and dispatches to whichever engines you have installed — Nano Banana for reference edits, Veo / open generation models, HyperFrames for HTML compositions and captions, Descript for text-based editing, or Remotion for programmatic motion graphics.
- `video-engine-routing` is the escalation path: the pricing table and graduation triggers for moving between subscription credits, pay-per-use APIs, and cloud ComfyUI — including the rule that integrated-GPU machines never render video locally.
- **Visual Provenance Guarantee:** Every image and video workflow requires an accompanying `.vis.provenance.json` sidecar capturing exact prompt, seed, model, and parameters to ensure zero orphan generations.

---

## Field Notes & Operating Architecture

Long-form walkthroughs of these pipelines, from the site:

- [The Research → Generation Flywheel](https://www.frankx.ai/blog/the-research-generation-flywheel-sandcastles-higgsfield-grok-2026)
- [Faceless Video: AI Narration + Multi-Engine B-Roll](https://www.frankx.ai/blog/using-elevenlabs-for-faceless-youtube-channels-and-higgsfield-for-b-roll)

These skills ship inside [Agentic Creator OS](https://github.com/frankxai/agentic-creator-os), the full creator operating system — productized as the [ACOS Creator Kit](https://www.frankx.ai/acos?utm_source=github&utm_medium=readme&utm_campaign=creator-skills).

---

## Related Lanes

- [frankxai/skills](https://github.com/frankxai/skills) — the architect lane: MCP, orchestration, model routing, context engineering.
- [starlight-agent-skills](https://github.com/frankxai/starlight-agent-skills) — the canonical Starlight skill repository with contracts, adapters, and evals.
- [agentic-creator-os](https://github.com/frankxai/agentic-creator-os) — the full creator operating system these skills ship inside.

---

## License

MIT — see [LICENSE](LICENSE).
