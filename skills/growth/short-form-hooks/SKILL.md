---
name: short-form-hooks
description: Use when writing, fixing or testing the opening of a short vertical video: TikTok, Instagram Reels, YouTube Shorts, Facebook Reels or similar. Triggers include "hook", "first 2 seconds", "first three seconds", "people swipe away", "scroll-stopping opening", "my Reels die at second 2", "write hooks for this video", "test hooks", "improve retention on Shorts". Works with any editing or generation tool. Produces hook options across picture, sound and on-screen text, picks the strongest, and writes a test plan with decision rules set before posting.
version: 0.1.0
argument-hint: "[what the video is about] [platform]"
---

# Short-form hooks

The hook is the first two seconds of a vertical video. In that time the viewer decides to stay or swipe. A hook is a promise: it tells the viewer what they get if they keep watching. A hook that wins the swipe and breaks the promise loses the viewer at second five instead of second one.

This skill is tool-neutral. It writes what should be on screen, in the ear and in the text; any camera, editor or video generator can make it.

## Ground first

Each platform names and measures early drop-off differently, and the names change. Before setting test metrics, open the platform's current analytics help page and record, with URL and read date:

- Which metric shows how many viewers left in the first seconds (a swipe-away share, a "stayed to watch" share, or the start of a retention curve).
- Whether the platform offers a built-in way to test a video on non-followers or to compare versions, and who is eligible.
- Current on-screen safe zones: where captions, buttons and the username cover the frame.

If a metric or feature cannot be confirmed on an official page, mark it `[unverified]` and do not build a decision rule on it. Never quote benchmark percentages from memory; compare against the creator's own past videos instead.

## Step 1: find the promise

Before writing any hook, write one sentence: "If you keep watching, you will ___." The blank is specific: a result, an answer, a reveal, a feeling. If the creator cannot fill it, the video has a content problem a hook cannot fix. Say so.

Then find where in the video the promise is paid off, as a timestamp. A promise paid at second 50 of a 60-second video needs a stronger reason to stay than one paid at second 10.

## Step 2: write hooks on three channels

A hook happens on three channels at once. Many viewers start with sound off, so the picture and the text must work alone.

| Channel | What it does in the first two seconds |
|---|---|
| Picture | The first frame is already the interesting thing. No logo, no walk-in, no setting up the shot. |
| Sound | The first words carry the promise. No "hey guys", no name, no "so today". |
| Text | A few words on screen that make sense without sound, placed inside the safe zone. Not a transcript of the voice. |

Write at least eight hooks for the same video, using different patterns:

1. **Result first.** Show the finished thing, then rewind to how.
2. **Middle of the action.** Start the clip after the setup.
3. **The viewer's problem, in their words.** Use the phrase they would type or comment.
4. **A claim with visible proof.** Say it while the evidence is on screen.
5. **A specific number or detail** that makes the promise concrete.
6. **A wrong belief**, named and about to be corrected.
7. **A question only this video answers**, never one the viewer can answer with "no."
8. **A pattern break**: an image or sound that does not belong, explained right after.

For each hook, write all three channels: first frame description, first spoken line, on-screen text.

## Step 3: cut to the best three

Score each hook from 0 to 2 on:

- **Works muted.** Picture and text alone carry the promise.
- **Specific.** It could only belong to this video.
- **True.** The video pays it off, and soon.
- **Fast.** The promise lands within two seconds, not after a pause.
- **Native.** It looks like the platform, not like an ad.

A 0 on "True" removes the hook regardless of total. Keep the top three. If none scores 8 or more out of 10, go back to step 1; the promise is probably vague.

## Step 4: bridge to the body

The two to five seconds after the hook decide whether the hook was a trick. Write the bridge for each finalist: the line or cut that moves from the promise into the content and shows the payoff is coming. Remove anything between the hook and the bridge.

## Step 5: test plan

Organic short-form has no perfect A/B test. Write the plan so the result means something anyway, and decide the rules before posting.

- **What changes.** Only the first two seconds. The body, length, caption, sound and posting time stay as close to identical as possible.
- **How to test.** In order of preference: the platform's own test feature for non-followers if it exists and the creator is eligible; posting the variants on different days at the same time; or the same variant on different platforms only as a sanity check, never as the test itself, because audiences differ.
- **The deciding metric.** The early drop-off metric you grounded above. Total views is not the deciding metric; it depends on too much besides the hook.
- **Baseline.** The same metric from the creator's last ten videos of similar length and topic. A hook wins only if it beats the baseline.
- **Minimum data.** The creator picks a minimum number of views per variant before anyone looks. Below it, record "not enough data."
- **Rules.** Keep, iterate or drop, each with a number set now. Example form: "keep if early drop-off is at least N points better than baseline; drop if worse than baseline."

## Step 6: hook bank

After every test, add one row to a hook bank the creator keeps: date, video, pattern used, the three channels, metric result versus baseline, and one sentence on why it worked or failed. After a few rounds the bank shows which patterns work for this creator's audience.

## Output

A hook sheet:

1. The promise sentence and the payoff timestamp.
2. Grounding table: metric or feature, source URL, read date.
3. All hooks with picture, sound and text.
4. Scores, and the top three with their bridges.
5. The test plan with the rules written in advance.
6. The hook bank row template.

## Guardrails

- No hook that the video does not pay off.
- No fake urgency, fake numbers, fake reactions, or claims the creator cannot show.
- Do not post, schedule or upload. The creator publishes.
- Do not present a benchmark as fact unless it comes from an official page you read or the creator's own analytics.
