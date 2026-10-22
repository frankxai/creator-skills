---
name: creator-launch
description: Use when a creator wants to launch something they made to their own audience: a course, template, preset pack, ebook, community, paid newsletter, coaching slot or digital product. Triggers include "creator launch", "launch my course", "launch my product to my followers", "pre-launch", "waitlist", "founding members", "how do I sell this to my audience", "launch plan for my channel". Builds one offer, one waitlist, one gift and one founding window, then stages the announcement for the creator to post. Plans and drafts only; the creator publishes, sends and sets the price.
version: 0.1.0
argument-hint: "[what you are launching] [where your audience is]"
---

# Creator launch

A launch for one creator and one offer. You end with a waitlist people can join from a link in bio, a gift that arrives right after they join, a founding window with a real closing date the creator picks, and a set of drafted posts and emails the creator sends themselves.

Bigger product launches with a team, pricing research and paid channels belong in a full launch playbook. This skill is the version that fits one person and a phone.

Nothing here posts, sends, schedules, charges or sets a price; the creator does each of those.

## Ground first

Platform features change often: link-in-bio limits, pinned posts, broadcast channels, community tabs, newsletter tool forms. Before relying on any feature, check the platform's own help pages and write down the source URL and the date you read it. If you cannot confirm a feature, mark it `[unverified]` and plan without it. Never quote fees, limits or reach numbers from memory.

## Step 1: the one offer

Write the offer in one sentence a follower would repeat to a friend: who it is for, what they get, what changes for them. If it takes two sentences, the offer is two products. Pick one.

Ask the creator, and record the answers:

- What do followers already ask you for, in comments, DMs or replies? Quote three real messages if they have them.
- What would someone do with this in their first hour?
- What is the smallest version still worth paying for?

Anything the creator cannot answer stays `[OPEN]`. Do not fill gaps with plausible guesses.

Writes `launch/01-offer.md`.

## Step 2: the gift

The gift is a working piece of the offer itself, delivered the moment someone joins the waitlist: one lesson from the course, three presets from the pack, the first chapter, one template. A PDF about the offer does not count.

- It must be usable in under fifteen minutes.
- It must make the paid version easier to imagine.
- It is delivered by the waitlist tool's automatic confirmation email or a download page, never by the agent sending mail.

Writes `launch/02-gift.md`: what it is, the file or page it lives on, and the exact confirmation email draft.

## Step 3: the waitlist door

One page, one message, one action. Use what the creator already has: a form from their newsletter tool, a page on their site, or a link-in-bio page that supports email capture. Do not build a custom form when the creator's existing tool has one.

The page carries:

- The one-sentence offer from step 1, in the follower's words.
- What the gift is and that it arrives right away.
- The founding window: what founding members get and when it closes (step 4).
- An email field. After sign-up, up to three optional questions: what price feels fair (offer bands, not a blank), what they want to use it for, and how they found the page. The price answers are the creator's first real pricing evidence.

Write it for a phone first; most followers arrive from a social app's in-app browser. Then do one pass that only cuts words.

Writes `launch/03-door.md`: the page copy, the tool used, and the questions.

## Step 4: the founding window

Founding members get status and permanence:

- The price they pay stays theirs for as long as they stay.
- Their name in the credits, a founding role in the community, or early input on what gets built next.
- First access before the public opening.

The only scarcity is the window itself: it opens when the waitlist opens and closes on a date the creator chooses and keeps. No countdown timers that reset, no "only 12 spots left" unless the creator truly has 12 coaching slots, no seat counts on a digital file, no price anchor that never existed. If the creator has not picked a closing date, the window is `[OPEN]` and the page says "founding members get" without a deadline.

Writes `launch/04-window.md`.

## Step 5: stage the announcement

Plan two to three weeks of posts across the places the audience already is. For each piece, write the draft and the date it would go out. The creator posts it.

- **Announcement post or video.** Lead with the outcome for the follower, then the gift, then the link. For short-form video, run `short-form-hooks` on the first two seconds. For a YouTube video, run `youtube-packaging` on the title, thumbnail and opening.
- **Proof posts.** Show the gift in use, a before and after, a reply from someone who tried it. Only real material; no invented testimonials.
- **Reminder posts.** One when the gift lands with the first people, one near the window's close. Say what is true: how long is left, not how many "spots."
- **Email to existing list.** If the creator has a list, one email announcing the waitlist and one before the window closes.
- **Pinned and bio.** The link in bio and one pinned post point to the waitlist for the whole window.

Writes `launch/05-stage.md`: the calendar, every draft, and where each one goes.

## Step 6: read and decide

Set a read date, usually two weeks after opening. On that date the creator looks at:

- Sign-ups, and which post or platform each came from (use a separate link or UTM per platform).
- The price band answers. If most people chose a band below the creator's planned price, revisit the price before opening sales.
- Replies and DMs that ask questions the page did not answer.

Write down in advance the number that would change the plan, for example "under N sign-ups by the read date means we rework the offer, not the posts." The creator picks N.

Writes `launch/06-read.md` and `launch/00-index.md`: what was made, what was verified, and the decisions only the creator makes: the price, the closing date, and what gets posted and sent.

## Output

A `launch/` folder with seven files and an index. The index lists every draft that is waiting for the creator to publish.

## Guardrails

- Never post, send, schedule, charge, or set a price. Never enter payment details.
- No invented numbers: no fake follower counts, sign-up counts, testimonials or scarcity.
- Waitlist emails and answers are personal data. Keep them in the creator's tool, out of the launch folder and out of any repository.
- Unknown is `[OPEN]`.
