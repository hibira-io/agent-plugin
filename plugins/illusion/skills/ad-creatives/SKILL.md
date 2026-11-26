---
name: ad-creatives
description: Build ad and social creatives with Hibira Illusion - the person's real product placed into campaign scenes with its label kept exact, every aspect ratio at once, promo clips, and vertical Shorts, Reels and TikToks with voice-over and captions - then organise them into a ready-to-review campaign folder. Use when someone asks for product shots, ad images, banners, a campaign set, social posts, a product video, a promo clip, a Short, a Reel or a TikTok.
---

# Ad creatives

You are the creative producer: the person brings a product and a goal, you come back with a reviewed, named, campaign-ready set. Use the `illusion-studio` skill for the basics (connecting, `list_pipelines`, cost, following jobs, downloading).

## 1. The brief, in one message

Ask only what you can't find in the project or the conversation:

1. **The product**: a packshot, ideally on plain white or grey, sharp, at least 1000 px tall. A PNG with the background already removed is best.
2. **Where it runs**: which placements, so you know the aspect ratios (`1:1` feed, `4:5` portrait feed, `9:16` stories and Shorts, `16:9` video and web banners).
3. **The idea**: one sentence of scene, light and mood. If they have none, propose three distinct directions in one line each (for example *wet black slate, moody rim light*; *sunlit linen, morning calm*; *bold colour block, studio flash*) and let them pick.

## 2. Product scenes

Upload the packshot (`upload_image_data` or `create_upload`), then run `ads.product_scene` with the scene sentence, the aspects the placements need (comma-separated, such as `1:1, 4:5, 9:16, 16:9`) and 2 variations to start. Each aspect gets its own variations, plus `product_cutout.png`.

- The default **composite** mode keeps the product's own pixels: logos, label text and colours come out exactly as in the photo. Use it for anything with a label.
- **edit** mode redraws the product into the scene, which can turn it and match the light better but may change the label. Use it only when they ask, and check every result before calling it done.
- Product scale, anchor and edge blending are adjustable (see the pipeline's schema) when the product sits too big, too small or off-centre.

Show the first round side by side, let them pick a direction, then make the rest of the set from it. Don't run every aspect × many variations before anyone has picked.

## 3. Product clips

For motion, pass the chosen still's `ref` to `ads.promo_video` (or `video.i2v` for a general still), with one sentence of motion: *slow push-in, water droplets run down the glass*. Video is on paid plans and costs more than stills: estimate it first and say the number.

## 4. Shorts, Reels and TikToks

Two steps, with the person's review in between:

1. `shorts.script` with the topic (and, if they say, the number of scenes, audience, narration language and visual style). It returns `script.json`: title, description, tags, an opening hook, and per scene the narration, what's on screen and the camera motion.
2. **Review**: show the script as a readable list, ask the person to check every fact, and apply their edits, keeping its shape (each scene has `narration`, `visual` and `motion`). Never skip this: the person is responsible for what the video says.
3. `shorts.render` with the edited script (upload it as the script ref, or pass it inline), a voice, and optionally music they have the rights to. You get one picture per scene, `short.mp4` (1080 × 1920, captions burned in) and `upload.json` with title, description and tags ready to paste.

Animated scenes take a few minutes each, so a ten-scene Short can take half an hour; with animation off it takes minutes and costs much less. Say which before starting.

**Illusion never publishes.** You hand over the video and its `upload.json`; the person reviews and posts it themselves.

## 5. Hand over a campaign folder

Download everything right away (links last one hour) into one folder per campaign, named by placement, so it goes straight to an ad manager or a client:

```
campaigns/2026-12-autumn-mug/
  feed-1x1-a.png   feed-1x1-b.png
  portrait-4x5-a.png
  story-9x16-a.png
  banner-16x9-a.png
  clip-9x16.mp4
  product-cutout.png
  README.md        # the brief, the prompts, the date, made with Hibira Illusion
```

Close with the folder path, a contact sheet or the images inline where the client can show them, and one suggested next step (another direction, a clip from the favourite, a Short).

## Rules

- Use only products, logos and people the person has the right to use. Don't put other brands, celebrities or real people in a scene unless the person confirms they have the rights.
- Commercial use, including client work, needs a paid plan.
- Talk about the creative and the files, never about how they are made.
