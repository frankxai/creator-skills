---
name: video-engine-routing
description: Decide WHERE video/image generation runs when cost, volume, or capability forces a choice - subscription credits vs pay-per-use APIs vs cloud ComfyUI. Use when asked "which video engine should I use", "is Higgsfield/fal/RunComfy worth it", "credits ran out", "cheapest way to generate N clips", "do I need ComfyUI", "should I run this locally", or when the video-gen skill escalates a budget or capability ceiling. Contains the pricing table, graduation triggers, and the never-local rule for iGPU machines.
version: 1.0.0
---

# video-engine-routing — when you outgrow your default engine

The default stack (see `video-gen`) assumes a subscription engine. This skill is the
escalation path: what to do when credits run out, volume grows, or the pipeline needs
control the subscription engine cannot give.

## The decision tree

1. **Under ~50 clips/month, mixed styles, no custom pipeline** → stay on the subscription
   engine (Higgsfield or equivalent). Sunk cost, routing across many models, zero ops.
2. **Bursty overflow or budget clips at volume** → pay-per-use API (fal.ai). No subscription,
   no credit expiry, cheapest per-clip for budget models.
3. **Custom pipeline: LoRA character consistency at batch scale, ControlNet/IPAdapter
   chains, motion transfer, community models** → cloud ComfyUI (RunComfy machines or
   Comfy Cloud). You are paying for control, not per-clip price.
4. **Local GPU rendering** → only with a recent NVIDIA card with 16 GB+ VRAM. On an iGPU
   machine (Intel Arc/AMD APU, shared memory): never. Modern video models blow through
   shared-memory budgets, and quantized variants degrade video coherence. Cloud is
   faster and cheaper than wasted local hours.

## Pricing reference (mid-2026, one 5-second 1080p clip)

| Route | Cost per 5s clip | Notes |
|---|---|---|
| Higgsfield subscription | ~USD 0.30–0.50 in credits | tiers USD 15–129/mo; credits don't roll over |
| fal.ai — Seedance 2.0 Fast | ~USD 0.11 | cheapest respectable social clip |
| fal.ai — Kling | ~USD 0.35 | pay-per-second, no minimums |
| fal.ai — Veo 3.1 Fast | ~USD 0.50 (720p) | 4K tier ~3× |
| RunComfy machines | USD 0.99–9.59/hr + Pro USD 20/mo | custom ComfyUI workflows; cold-start overhead makes single clips uneconomic |
| Comfy Cloud | USD 20/mo ≈ 180 GPU-min | official ComfyUI cloud, credit-based |
| ComfyDeploy | — | defunct; stack was open-sourced, managed service gone |

Recompute before deciding: prices move quarterly. The *structure* (subscription vs
per-use vs machine-rental) is what stays stable.

## Graduation triggers

- **To fal.ai**: monthly credit top-ups exceed ~USD 20 two months running, or you need one
  premium model your subscription lacks.
- **To cloud ComfyUI**: you need the same character across 10+ videos via LoRA, or a
  ControlNet/IPAdapter/motion-control chain no API engine exposes, or 100+ clips/month of
  one repeatable workflow where machine-hours beat per-clip pricing.
- **Back down**: if a rented workflow runs less than monthly, cancel the machine and take
  the per-use price. Idle infrastructure is the most expensive engine.

## What not to do

- Don't install vendor API-wrapper skill packs for engines you don't pay for — every one
  of them is lock-in to that vendor's endpoint with no portable workflow definition.
- Don't run modern video models on integrated GPUs (see rule 4 above).
- Don't hold two overlapping subscriptions to hedge; pick one default and use per-use
  APIs as the hedge.

## Credits

The single-dispatcher/model-leaf routing pattern used by `video-gen` is adapted from the
router design in agentspace-so's RunComfy skill pack — pattern absorbed, dependency skipped.

Disclosure: I am a Higgsfield Ambassador; Higgsfield links on my site may be affiliate links.
This skill's routing logic does not depend on that relationship — the decision tree sends
you to fal.ai or ComfyUI whenever those genuinely win.
