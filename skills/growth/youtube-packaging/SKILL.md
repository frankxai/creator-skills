---
name: youtube-packaging
description: Use when deciding the title, thumbnail and opening of a long-form YouTube video, before or after filming. Triggers include "YouTube title", "thumbnail idea", "packaging", "low CTR", "nobody clicks my videos", "people click then leave", "first 30 seconds", "video intro", "A/B test my thumbnail", "title and thumbnail ideas". Treats the title, the thumbnail brief and the first 30 seconds as one promise, written together. Tool-neutral: the thumbnail is a brief any designer, photo or image tool can execute. Includes a test plan with rules set in advance.
version: 0.1.0
argument-hint: "[video topic or script] [channel niche]"
---

# YouTube packaging

The title and thumbnail make a promise. The first 30 seconds keep it or break it. Most packaging advice treats them as three separate jobs, which is how a video gets a strong click and then loses viewers in the first minute. Write them together, as one decision.

This skill does not generate images. It writes a thumbnail brief that any designer or image tool can make, and hands off to an image skill if one is installed.

## Ground first

YouTube's tools and metrics change. Before using any of them, open YouTube's own help pages and record, with URL and read date:

- Whether YouTube Studio's title and thumbnail testing is available for this channel and this video type, how many variants it allows, and which metric decides the winner.
- The current names and definitions of the click metric and the retention metric in YouTube Studio analytics.
- How titles truncate on the surfaces that matter (home feed, search, suggested, mobile). Check by looking, not by remembering a character count.

Anything you cannot confirm on an official page is `[unverified]`. Do not base a decision rule on it. Never quote benchmark click or retention rates from memory; compare against the channel's own videos.

## Step 1: the click sentence

Write one line: "A viewer clicks because they want to ___, and this video is the one that gives it to them because ___." The second blank is the angle: what this video has that the other results for the topic do not.

If the second blank is empty, search YouTube for the topic and record what the top results already promise (title pattern, thumbnail pattern), with the date. The angle is what is missing from that page. Packaging cannot rescue a video that has no angle; say so plainly if that is the finding.

## Step 2: titles

Write ten titles, then keep three. Each one:

- Uses the words the viewer would type or say, not the creator's internal name for the topic.
- Is specific: a number, a name, a result, a situation.
- Opens a gap the video closes. The gap is honest: the answer is in the video, early.
- Puts the important words first, so a truncated title still makes sense.
- Does not repeat what the thumbnail says. Title and thumbnail split the job.

Reject titles that would be accurate for a dozen other videos.

## Step 3: thumbnail brief

The thumbnail is read at the size of a phone feed in under a second. For each of the three titles, write one thumbnail concept as a brief:

- **One subject** and **one focal point**. If the eye has two places to go, cut one.
- **The visual half of the promise.** If the title names the outcome, the thumbnail shows the tension or the before; if the title asks the question, the thumbnail shows the stakes.
- **Text: three words or fewer, or none.** Never the title again.
- **Faces only when the emotion is the point**, and the expression matches the video's real tone.
- **Contrast** against the platform's light and dark backgrounds.
- **A small-size check.** View the mockup at feed size on a phone before choosing. If the focal point is not obvious at that size, it fails.

Write each brief so a designer, a photographer or an image model can execute it: subject, composition, background, text and placement, mood, and what must not appear. If an image skill such as `acos-visual-gen` or `video-gen` is installed, hand the brief to it.

## Step 4: the first 30 seconds

The opening confirms the click. Script it after the title and thumbnail are chosen, against that promise.

| Time | Job |
|---|---|
| 0 to 5 s | Show the thing the title and thumbnail promised, or the clearest glimpse of it. The viewer must think "yes, this is the video I clicked." |
| 5 to 15 s | Why it matters: the stakes, the mistake, the cost of not knowing. |
| 15 to 30 s | What is coming and why to stay: the path through the video, and one open question answered later. |

Cut everything that delays the confirmation: channel intro, logo sting, "before we start", requests to subscribe, sponsor reads, long greetings. Move them later or remove them.

## Step 5: coherence check

Read the title. Look at the thumbnail at feed size. Read or watch the first 30 seconds. Answer three questions:

1. Do all three make the same promise?
2. Does the opening confirm the promise within five seconds?
3. Would a viewer who clicked feel the video was what they expected?

Any "no" sends you back to the step that broke it.

## Step 6: test plan

Write the rules before the video goes live.

- **If YouTube's built-in title and thumbnail test is available** for this video (per the grounding step), test up to the allowed number of variants of the package, all consistent with the same opening. Let YouTube's chosen metric decide, and do not stop the test early because of a first-day spike.
- **If it is not available**, use a sequential change: run the first package for a fixed period, change one element (title or thumbnail, not both), run the same period, compare. State that this is weaker evidence because traffic changes over time.
- **The deciding view.** The click metric alone misleads: a higher click rate with lower retention is a worse package. Judge on the pair, or on watch time if the platform's test uses it.
- **Baseline.** The channel's own recent videos of similar length and topic.
- **Rules set now.** Keep, change or revert, each with the number the creator chooses.

## Output

A packaging sheet:

1. Grounding table: feature or metric, source URL, read date.
2. The click sentence and the angle, with the competing results you checked and when.
3. Ten titles, the three kept, and why.
4. Three thumbnail briefs, each paired with a title.
5. The first-30-seconds script for the chosen package.
6. The coherence check answers.
7. The test plan with rules written in advance.

## Guardrails

- No title or thumbnail the video does not pay off, and no misleading image of what happens in the video.
- No fake reactions, fake numbers or claims the creator cannot show.
- Do not upload, publish, change a live video's title or thumbnail, or start a test. The creator does that in YouTube Studio.
- Use only images the creator owns or has the right to use, and follow YouTube's thumbnail policies as read on the grounding date.
