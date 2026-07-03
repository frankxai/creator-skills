---
name: video-gen
description: Route any image or video generation request to the right engine and pipeline. Use when asked to "make a video", "generate an image", "create b-roll", "make a video ad", "animate this photo", "clip for socials", "product shot", "talking head", "faceless video", "YouTube short", "UGC video", or any multi-step visual content request. Classifies intent by deliverable, identity consistency, and destination, dispatches to installed engine skills (Higgsfield, Nano Banana, Grok Imagine), then chains assembly (HyperFrames) and editing/publishing (Descript). For pricing or capability ceilings, hand off to video-engine-routing.
version: 1.0.0
---

# video-gen — the routing brain for visual content

One dispatcher, many engines. Intents stay stable; engines are swappable. When an engine
changes, this file changes — the prompts and pipelines that call it do not.

## Stack prerequisites

This skill routes to engines you install separately. Missing engines degrade gracefully — the
router picks the next-best available and says so.

| Engine | Role | Install |
|---|---|---|
| Higgsfield CLI + skills | Default image and video engine (paid account) | `curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh \| sh`, then sync the vendor skills (higgsfield-generate, higgsfield-soul-id, higgsfield-product-photoshoot, higgsfield-marketplace-cards) |
| Gemini API key | Nano Banana image gen and edits (character/reference work) | `GEMINI_API_KEY` env var |
| Grok Imagine | Fast stylized images if you have a SuperGrok subscription | vendor CLI/app |
| HyperFrames | HTML video compositions, captions, TTS, audio-reactive motion | `npx hyperframes` + its skills |
| Descript MCP | Edit by editing text: cuts, filler removal, captions, publish | connect the Descript MCP server |

## Step 1 — classify the request

Three axes decide everything downstream:

| Axis | Values |
|---|---|
| Deliverable | still image · single clip (≤15s) · assembled video (edited, multi-scene) |
| Identity consistency | none · product (same object every shot) · face (same person every shot) |
| Destination | social feed · marketplace listing · YouTube · website/hero · ad campaign |

If the user did not specify duration, aspect ratio, or destination, infer from context; ask only
when the answer changes the engine choice.

## Step 2 — dispatch

| Intent | Route | Why |
|---|---|---|
| Product/brand still | higgsfield-product-photoshoot | prompt templates for studio, lifestyle, hero, carousel |
| Marketplace listing set | higgsfield-marketplace-cards | compliant main image + secondary + A+ modules |
| Same face across shots | higgsfield-soul-id (train once) → higgsfield-generate with the Soul id | identity persists across images and video |
| Generic still, design, legible text | higgsfield-generate (GPT Image 2) | strongest text rendering |
| Character/reference image edit | Nano Banana via Gemini API | best reference-following for edits |
| Fast stylized still | Grok Imagine | included in a SuperGrok subscription, zero marginal cost |
| Single video clip, default | higgsfield-generate (Seedance 2.0) | best price/quality for social clips |
| Single video clip, cinematic | higgsfield-generate (Kling 3.0) | motion quality, camera control |
| Branded ad with avatar/product | Higgsfield Marketing Studio (via higgsfield-generate) | hooks, avatars, product placement in one flow |
| Captions, title cards, audio-reactive motion, scroll video | HyperFrames composition | deterministic HTML video, no generation cost |
| Cut, rearrange, remove filler, subtitle, publish | Descript MCP (`import_media` → `prompt_project_agent` → export) | text-based editing beats timeline scrubbing |

Fallback order when an engine is missing: Higgsfield → Nano Banana (images only) → Grok
Imagine (images only). If no video engine is installed, stop and say which install unblocks.

## Step 3 — pipelines

**30-second product ad**
1. higgsfield-product-photoshoot → 3 stills (hero, lifestyle, closeup)
2. higgsfield-generate image-to-video on the hero (Seedance 2.0, 5s)
3. HyperFrames: title card + price overlay + end card around the clip
4. Descript: assemble, caption, export per destination aspect ratio

**Faceless YouTube b-roll batch**
1. Script beats → one prompt per beat
2. higgsfield-generate batch (Seedance 2.0, 5s each)
3. Voiceover: HyperFrames TTS, or ElevenLabs if the user has it
4. Descript: import all, sequence to narration, auto-captions

**Talking-head with a consistent face**
1. higgsfield-soul-id: train once, store the reference id
2. higgsfield-generate with the Soul id → presenter clips
3. Descript: filler-word removal, captions, publish

**Caption-heavy short (quote/hook format)**
1. Still from the dispatch table (or user-supplied)
2. HyperFrames: audio-reactive captions, marker highlights, beat-synced motion
3. Render via HyperFrames; no Descript needed

## Quality gate before publishing

For anything going to a paid placement or a growth channel, run the Higgsfield virality
predictor (`brain_activity`) on the finished cut: hook strength, retention risk, distraction.
Score low → fix the first 2 seconds before touching anything else.

## When you hit a ceiling

Credits exhausted, need a custom pipeline (LoRA, ControlNet, motion transfer), or per-clip
cost matters at volume → hand off to the `video-engine-routing` skill. It holds the decision
tree and current pricing for subscription vs pay-per-use vs cloud ComfyUI.
