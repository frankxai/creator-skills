---
name: video-gen
description: Route any image or video generation request to the right engine and pipeline. Use when asked to "make a video", "generate an image", "create b-roll", "make a video ad", "animate this photo", "clip for socials", "product shot", "talking head", "faceless video", "YouTube short", "UGC video", or any multi-step visual content request. Classifies intent by deliverable, identity consistency, and destination, dispatches to the engine skills you have installed (for example Higgsfield, Nano Banana, Grok Imagine), then chains assembly (HyperFrames) and editing/publishing (Descript). For pricing or capability ceilings, hand off to video-engine-routing.
version: 1.1.0
---

# video-gen — the routing brain for visual content

One dispatcher, many engines. Intents stay stable; engines are swappable. When an engine
changes, this file changes — the prompts and pipelines that call it do not.

## Stack prerequisites

This skill routes to engines you install separately. It does not recommend a vendor. It uses
the engines you already have, and when a role is missing it says which kind of engine unblocks
you, then points to `video-engine-routing` for the cost and capability comparison.

| Engine | Role | Install |
|---|---|---|
| Higgsfield CLI + skills | All-in-one image and video engine (paid account); vendor skills: higgsfield-generate, higgsfield-soul-id, higgsfield-product-photoshoot, higgsfield-marketplace-cards | Follow the vendor's official install docs and read any install script before you run it |
| Gemini API key | Nano Banana image gen and edits (character/reference work) | `GEMINI_API_KEY` env var |
| Grok Imagine | Fast stylized images if you have a SuperGrok subscription | vendor CLI/app |
| HyperFrames | HTML video compositions, captions, TTS, audio-reactive motion | `npx hyperframes` + its skills |
| Descript MCP | Edit by editing text: cuts, filler removal, captions, publish | connect the Descript MCP server |

Any other image or video engine that fits a role below (a pay-per-use API such as fal.ai, a
Veo or Kling account, cloud or local ComfyUI) works the same way: assign it to the role it
covers.

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

Pick the role first, then use the engine you have for it. The last column lists the shortcut
when that vendor's skill is installed.

| Intent | Role | Why | Shortcut if installed |
|---|---|---|---|
| Product/brand still | image engine with product-shot templates | studio, lifestyle, hero, carousel prompts | higgsfield-product-photoshoot |
| Marketplace listing set | image engine with listing templates | compliant main image + secondary + A+ modules | higgsfield-marketplace-cards |
| Same face across shots | identity engine (train a reference once, reuse it) | identity persists across images and video | higgsfield-soul-id → higgsfield-generate with the Soul id; a LoRA on ComfyUI does the same job |
| Generic still, design, legible text | image engine with strong text rendering | legible text is the deciding factor | higgsfield-generate (GPT Image 2) |
| Character/reference image edit | reference-following image editor | best at keeping the reference intact | Nano Banana via Gemini API |
| Fast stylized still | fast image engine | zero marginal cost if already subscribed | Grok Imagine (included in a SuperGrok subscription) |
| Single video clip, default | budget video engine | best price/quality for social clips | higgsfield-generate (Seedance 2.0) |
| Single video clip, cinematic | cinematic video engine | motion quality, camera control | higgsfield-generate (Kling 3.0) |
| Branded ad with avatar/product | ad-format video engine | hooks, avatars, product placement in one flow | Higgsfield Marketing Studio (via higgsfield-generate) |
| Captions, title cards, audio-reactive motion, scroll video | HyperFrames composition | deterministic HTML video, no generation cost | HyperFrames |
| Cut, rearrange, remove filler, subtitle, publish | text-based editor | text-based editing beats timeline scrubbing | Descript MCP (`import_media` → `prompt_project_agent` → export) |

If the engine for a role is missing, use the next-best one you have (an image-only engine can
cover stills, not clips). If no video engine is installed, stop, say which kind of engine
unblocks the request, and hand off to `video-engine-routing`.

## Step 3 — pipelines

Steps name the role; the engine in brackets is the shortcut when installed.

**30-second product ad**
1. Image engine, product-shot templates → 3 stills (hero, lifestyle, closeup) [higgsfield-product-photoshoot]
2. Video engine, image-to-video on the hero, 5s [higgsfield-generate with Seedance 2.0]
3. HyperFrames: title card + price overlay + end card around the clip
4. Descript: assemble, caption, export per destination aspect ratio

**Faceless YouTube b-roll batch**
1. Script beats → one prompt per beat
2. Video engine, batch, 5s each [higgsfield-generate with Seedance 2.0]
3. Voiceover: HyperFrames TTS, or ElevenLabs if the user has it
4. Descript: import all, sequence to narration, auto-captions

**Talking-head with a consistent face**
1. Identity engine: train once, store the reference id [higgsfield-soul-id]
2. Video engine with that identity → presenter clips [higgsfield-generate with the Soul id]
3. Descript: filler-word removal, captions, publish

**Caption-heavy short (quote/hook format)**
1. Still from the dispatch table (or user-supplied)
2. HyperFrames: audio-reactive captions, marker highlights, beat-synced motion
3. Render via HyperFrames; no Descript needed

## Quality gate before publishing

For anything going to a paid placement or a growth channel, check the finished cut for hook
strength, retention risk and distraction. If your engine has a predictor, use it (Higgsfield's is
`brain_activity`); otherwise review the first 2 seconds by hand against the same three points.
Score low → fix the first 2 seconds before touching anything else.

## When you hit a ceiling

Credits exhausted, need a custom pipeline (LoRA, ControlNet, motion transfer), or per-clip
cost matters at volume → hand off to the `video-engine-routing` skill. It holds the decision
tree and the cost structure for subscription vs pay-per-use vs cloud ComfyUI.
