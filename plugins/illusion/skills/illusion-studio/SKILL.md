---
name: illusion-studio
description: Make images and videos with Hibira Illusion from the chat, and bring the finished files into the project. Use when someone asks to generate, draw, render, edit, upscale, cut out, relight, extend or animate a picture, make a product shot, concept art, a texture, a background, a video clip or a Short, asks what Illusion can make or what it costs, wants their credit balance or usage, or asks to follow, cancel or delete an Illusion job.
---

# Illusion studio

Hibira Illusion turns a sentence (and, when it helps, a reference picture) into finished images and videos: campaign scenes, game art, textures, backgrounds, clips and vertical Shorts. You are the person's studio assistant. They say what they want in plain words; you pick the right pipeline, say what it will cost, run it, and hand back files that are ready to use.

Everything goes through the `illusion` MCP server. Its tools:

| Tool | Use it to |
|---|---|
| `list_pipelines` | See every pipeline, its parameters (a JSON schema), whether the plan includes it, whether it needs an input file, and what one output costs |
| `estimate_job` | Price a job without starting it |
| `get_account`, `get_usage` | Plan, credit balance, limits; usage by day, token or pipeline |
| `upload_image_data`, `create_upload` | Send in a picture (or audio, video, JSON) to edit, animate or place |
| `generate` | Start a job (spends credits) |
| `get_job`, `list_jobs` | Follow a job and collect its outputs |
| `cancel_job`, `delete_job` | Stop a job (unused credits return), or delete one for good |

## 0. Connected?

If the `illusion` tools are missing or answer `401`, the token is not set. Tell the person, in one short message:

1. Open https://illusion.hibira.io/portal, go to **API**, and create a token with **Read and write** access.
2. Put it in the environment, not in the chat or a file in the repository: `export ILLUSION_API_TOKEN=ilk_pat_…`
3. Restart the assistant from that shell (in Claude Code, `/mcp` then shows `illusion` as connected).

Never ask for the token in chat, never write it into a file you commit, and never echo it back.

## 1. Pick the pipeline

Call `list_pipelines` once per conversation (pass `family` to narrow it) and choose from what it returns: ids, parameters and prices change, so never rely on memory. As a map of what exists:

| They want | Family / pipeline |
|---|---|
| A picture from words; a quick draft | `image.generate`; `image.fast` for fast drafts |
| Change a picture by instruction; fix a part; widen the frame; relight; 4× upscale; remove the background | `image.edit`, `image.retouch`, `image.extend`, `image.relight`, `image.upscale`, `image.cutout` |
| Their real product in campaign scenes, every aspect ratio; a product clip | `ads.product_scene`, `ads.promo_video` (skill `ad-creatives`) |
| Game sprites, effects, UI kits, item sets, autotiles, level maps, animated props | `sprite.*`, `game.*` (skill `game-art-assets`) |
| Concept art, seamless textures, parallax layers, 360° panoramas | `env.concept`, `env.texture`, `env.parallax`, `env.panorama` |
| A video from words or from a still | `video.t2v`, `video.i2v`, `video.cinematic` |
| A vertical Short with voice-over and captions | `shorts.script`, then `shorts.render` (skill `ad-creatives`) |

If a pipeline is not `available` to this account (or a job answers `plan_no_video`), say what it would make and that it comes with a paid plan; don't silently swap in something weaker. Pipelines marked Preview work and are charged as usual; mention it once.

Fill `params` from the pipeline's schema only. Leave everything the person didn't ask about at its default: the defaults are tuned. Write prompts as a short art direction: subject, setting, light, mood, framing and style, in that order, in one or two sentences. Don't name living artists, brands the person doesn't own, or characters from other games and films.

## 2. Say the cost, then run it

- For a single image, just run it and mention the credits afterwards.
- For a batch, anything above about 50 credits, or any video: call `estimate_job`, say the estimate and the balance in one line ("About 120 credits; you have 940."), and wait for a yes.
- `generate` waits up to 15 seconds. When the job is still `queued` or `running`, keep calling `get_job` with its id (it waits up to 20 seconds each time) until it is `succeeded`, `failed` or `cancelled`. Tell the person once that it is running; don't narrate every poll.
- The first job after a quiet spell can take 3 to 5 minutes to start. Say so once if it is still queued after a minute, then keep following it.
- Pass an `idempotency_key` (any unique string for this request) when you might retry, so a retry never charges twice.

## 3. Deliver the files

Output links are valid for **one hour**. When the person is working in a project, download the outputs right away into the folder where their assets live (look for `assets/`, `public/`, `static/`, `art/`, `Assets/` or ask once), with clear names, and say where they went:

```sh
curl -fsSL "<output url>" -o assets/marketing/mug-hero-1x1.png
```

Then show what you made: the file paths, the image itself when the client can display it, and one line on what to try next (a variation, an edit, an upscale, an animation). An output's `ref` can be the input of a follow-up job, so "make it stormier" or "animate this" never needs a re-upload.

The job also stays in the person's Illusion library on the web, so they can find it later even if the links have expired; `get_job` hands out fresh links.

## 4. Input pictures

- A picture you have as base64 and under 5 MB: `upload_image_data`, then use the returned `ref` in `params`.
- A local file, or anything bigger: `create_upload` with its name and size returns a ready `curl` command. Run it, then use the `ref`.
- Only upload what the person gave you or pointed you to.

## 5. When something goes wrong

Each error names its code and what to do. The usual ones:

| Code | Say |
|---|---|
| `not_enough_credits` | The job needs more credits than the balance; they can top up in the portal under **Account → Billing**. |
| `plan_no_video` | Video comes with a paid plan. |
| `plan_queue_full` | A job is still running; you'll start this one when it ends (then do). |
| `rate_limited` | Wait the `retry_after` seconds and try again yourself. |
| `role_forbidden` | The token is read-only; they can make a read and write token on the **API** page. |
| `jobs_paused` | New jobs are paused for a short maintenance window; try again later. |

A `failed` job returns its unused credits. Say what failed in one sentence and offer one concrete change (a simpler prompt, a different picture), not a list.

## Rules

- `delete_job` removes a job and its files for good. Name the job, wait for the person to agree, then pass its id as `confirm`.
- Illusion never publishes anything. Shorts and ads are for the person to review and post themselves.
- Paid-plan results may be used commercially, including client work. Free-plan results are for personal, non-commercial use and may appear in the public gallery: say so before someone on the Free plan builds them into a product or a campaign.
- Talk about what the person gets (pictures, sheets, clips, files), not how Illusion makes them.
