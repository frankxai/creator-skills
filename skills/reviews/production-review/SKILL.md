---
name: production-review
description: Use when the user asks to review or pressure-test a video / content plan BEFORE generating it — triggers include "review my video plan", "is this worth generating", "pre-flight my shoot", "grill my content idea", "will this convert", "should I spend credits on this". Grills the brief for hook, destination-fit, identity-consistency, and cost, then hands a go / rework verdict to the video-gen router.
version: 1.0.0
---

# Production Review

A user-invoked review. The user types for it. Your job is to **grill a content or video plan before a single credit is spent.** Generation is cheap per clip and ruinous in aggregate when the brief was wrong. Catch the wrong brief here, not after 40 renders.

You are interrogating four things. Be direct. A weak hook is a weak hook.

## How to run it

1. Get the brief: what's being made, for whom, where it's going. If the user can't say the hook in one sentence, that's the first finding.
2. Interrogate the four dimensions below, one at a time. Push back where it's soft.
3. Score each GO / SOFT / KILL with the reason.
4. Deliver the verdict and, if GO, hand the concrete engine + pipeline recommendation to the `video-gen` router. If cost is the open question, route to `video-engine-routing`.

## The four interrogations

### 1. Hook — the first two seconds
- State the hook in one sentence. Would it stop the scroll for the target viewer?
- What happens in second 0–2 on screen? If it's a logo or a slow pan, it's dead.
- Is there a reason to keep watching at second 3?

KILL if the hook can't be said in a sentence or the open is a warm-up.

### 2. Destination fit
- Where does this go — feed, Shorts/Reels, YouTube, listing, ad? Aspect ratio and length to match?
- Does the format fit the platform's norms, or is it a landscape talking-head being forced into vertical?
- One asset for many destinations, or the right cut per destination?

SOFT if format and destination don't match; name the reframe.

### 3. Identity & consistency
- Does anything need to stay consistent across shots — a face, a product, a character?
- If a face: is a trained Soul identity needed (→ `higgsfield-soul-id`), or is one-shot fine?
- If a product: same object every frame, or will it drift and break trust?

Flag the consistency requirement so the router picks the right engine, not a cheaper one that drifts.

### 4. Cost & scale
- How many generations does this brief actually imply (variations × shots × retries)?
- Which engine, at what per-clip cost, and does that fit the budget for the expected return?
- Is this a one-off (subscription credits fine) or a repeatable batch (→ `video-engine-routing` for the graduation call)?

KILL if the expected cost outweighs the plausible return; say so before the spend, not after.

## The verdict

```
PRODUCTION REVIEW — <one-line brief>

| Dimension              | Verdict  | Why |
|------------------------|----------|-----|
| Hook (first 2s)        | GO/SOFT/KILL | ... |
| Destination fit        | GO/SOFT/KILL | ... |
| Identity & consistency | GO/SOFT/KILL | ... |
| Cost & scale           | GO/SOFT/KILL | ... |

CALL: generate / rework / drop — <one honest sentence>
IF GENERATE → route: <engine + pipeline for video-gen>, est. cost <n>
```

## Rules

- Say the hook out loud or it doesn't exist.
- A SOFT is a rework instruction, not a maybe — name the specific fix.
- Protect the credits. "Drop it" before a bad spend is a win, not a failure.
- On GO, hand off cleanly to `video-gen` (and `video-engine-routing` if cost is the deciding factor) — don't re-litigate the routing here.
